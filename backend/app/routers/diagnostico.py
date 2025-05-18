import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.database import models
from datetime import datetime
from PIL import Image, ImageEnhance
from app.services.model_predictor import predictor
from app.services.chatgpt_service import interpretation_openIA
from app.utils.file_handler import save_upload_file

router = APIRouter(prefix="/diagnosticos", tags=["Diagnóstico"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/analizar-imagen")
async def analizar_imagen(original_image: UploadFile = File(...), zoom: int = Form(...), brightness: int = Form(...), contrast: int = Form(...),
    paciente_id: int = Form(...), db: Session = Depends(get_db), position_x: int = Form(...), position_y: int = Form(...) ):  
    
    paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()
    if not paciente:
        return {"error": "Paciente no encontrado"}

    diagnostico = db.query(models.Diagnostico).filter(
        models.Diagnostico.paciente_id == paciente_id,
        models.Diagnostico.resultado == None
    ).first()

    if not diagnostico:
        diagnostico = models.Diagnostico(
            paciente_id=paciente_id,
            resultado=None,
            descripcion=None,
            fecha_diagnostico=datetime.utcnow()
        )
        db.add(diagnostico)
        db.commit()
        db.refresh(diagnostico)

    save_path = save_upload_file(original_image)

    img = Image.open(save_path).convert("RGB")

    if zoom != 100:
        w, h = img.size
        new_w = int(w * zoom / 100)
        new_h = int(h * zoom / 100)
        img = img.resize((new_w, new_h), Image.LANCZOS)
        left = (new_w - w) // 2 - position_x
        top = (new_h - h) // 2 - position_y
        right = left + w
        bottom = top + h

        left = max(0, left)
        top = max(0, top)
        right = min(new_w, right)
        bottom = min(new_h, bottom)

        img = img.crop((left, top, right, bottom))

    img = ImageEnhance.Brightness(img).enhance(brightness / 100)

    img = ImageEnhance.Contrast(img).enhance(contrast / 100)

    os.makedirs("app/images/temporal", exist_ok=True)
    temp_aug_path = os.path.join("app/images/temporal", f"temp_aug_{uuid.uuid4().hex}.jpg")
    try:
        img.save(temp_aug_path)
        print(f"Imagen guardada correctamente en: {temp_aug_path}")
    except Exception as e:
        print(f"Error al guardar la imagen: {e}")

    resultado_dict = predictor.predict(temp_aug_path)
    # os.remove(temp_aug_path)

    nueva_imagen = models.Imagen(
        ruta_archivo=save_path,
        fecha_subida=datetime.utcnow(),
        diagnostico_id=diagnostico.id
    )
    db.add(nueva_imagen)
    db.commit()
    db.refresh(nueva_imagen)

    return {
        "prediccion_final": resultado_dict["prediccion_final"],
        "porcentajes": resultado_dict["porcentajes"],
        "diagnostico_id": diagnostico.id,
        "paciente_id": paciente_id
    }

@router.post("/saved-diagnostic")
async def guardar_diagnostico_final(diagnostico_id: int = Form(...), descripcion: str = Form(...), resultado: str = Form(...), db: Session = Depends(get_db) ):
    
    diagnostico = db.query(models.Diagnostico).filter(models.Diagnostico.id == diagnostico_id).first()
    
    if not diagnostico:
        raise HTTPException(status_code=404, detail="Diagnóstico no encontrado")

    if diagnostico.resultado:
        raise HTTPException(status_code=400, detail="Este diagnóstico ya tiene un resultado registrado")

    try:
        partes = [float(x.strip()) for x in resultado.split("-")]
        if len(partes) != 3:
            raise ValueError("El resultado no tiene 3 valores")
        benigno, ductal, lobulillar = partes
    except Exception:
        raise HTTPException(status_code=400, detail="Formato de resultado inválido")
    
    interpretation = interpretation_openIA({
        "Benigno": benigno,
        "Carcinoma ductal": ductal,
        "Carcinoma lobulillar": lobulillar
    })

    diagnostico.descripcion = descripcion
    diagnostico.resultado = resultado
    diagnostico.fecha_diagnostico = datetime.utcnow()

    db.commit()
    db.refresh(diagnostico)

    return {
        "diagnostico_id": diagnostico.id,
        "resultado": resultado,
        "descripcion": descripcion,
        "interpretacion": interpretation
    }

@router.delete("/eliminar/{diagnostico_id}")
def eliminar_diagnostico(diagnostico_id: int, db: Session = Depends(get_db)):
    diagnostico = db.query(models.Diagnostico).filter(models.Diagnostico.id == diagnostico_id).first()

    if not diagnostico:
        raise HTTPException(status_code=404, detail="Diagnóstico no encontrado")

    imagenes = db.query(models.Imagen).filter(models.Imagen.diagnostico_id == diagnostico_id).all()
    for img in imagenes:
        try:
            if os.path.exists(img.ruta_archivo):
                os.remove(img.ruta_archivo)
        except Exception as e:
            print(f"Error al eliminar imagen {img.ruta_archivo}: {e}")
        db.delete(img)

    db.delete(diagnostico)
    db.commit()

    return {"mensaje": "Diagnóstico e imágenes asociadas eliminadas correctamente"}