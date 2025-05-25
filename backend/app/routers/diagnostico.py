import os
import uuid
import pytz
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.database import models
from datetime import datetime
from PIL import Image, ImageEnhance
from app.services.model_predictor import predictor
from app.services.deepseek_service import interpretation_deepseek
from app.utils.file_handler import save_upload_file
from fastapi.responses import FileResponse
from app.utils.pdf_generator import PDF

pdf = PDF()
pdf.add_page()
peru_tz = pytz.timezone("America/Lima")

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
            fecha_diagnostico = datetime.now(peru_tz)
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
    
    interpretation = interpretation_deepseek({
        "Benigno": benigno,
        "Carcinoma ductal": ductal,
        "Carcinoma lobulillar": lobulillar
    })
    
    diagnostico.descripcion = descripcion
    diagnostico.resultado = resultado
    diagnostico.fecha_diagnostico = datetime.now(peru_tz)

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

@router.get("/listar")
def listar_diagnosticos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    diagnosticos = db.query(models.Diagnostico).filter(models.Diagnostico.resultado != None).order_by(models.Diagnostico.fecha_diagnostico.desc())\
        .offset(skip).limit(limit).all()

    listDiagnostic = []
    for diagnostic in diagnosticos:
        paciente = db.query(models.Paciente).filter(models.Paciente.id == diagnostic.paciente_id).first()
        imagenes_count = db.query(models.Imagen).filter(models.Imagen.diagnostico_id == diagnostic.id).count()

        listDiagnostic.append({
            "id": diagnostic.id,
            "paciente": f"{paciente.nombre} {paciente.apellido}" if paciente else "Paciente no encontrado",
            "resultado": diagnostic.resultado,
            "descripcion": diagnostic.descripcion,
            "fecha_diagnostico": diagnostic.fecha_diagnostico.strftime("%Y-%m-%d %H:%M"),
            "cantidad_imagenes": imagenes_count
        })

    return listDiagnostic

@router.get("/imagenes/{diagnostico_id}")
def obtener_imagenes(diagnostico_id: int, db: Session = Depends(get_db)):
    imagenes = db.query(models.Imagen).filter(models.Imagen.diagnostico_id == diagnostico_id).all()
    rutas = []
    for img in imagenes:
        filename = os.path.basename(img.ruta_archivo)
        rutas.append(f"/images/{filename}")
    print("Rutas generadas:", rutas)
    return rutas

@router.get("/descargar-pdf/{diagnostico_id}")
def descargar_pdf(diagnostico_id: int, db: Session = Depends(get_db)):
    diagnostico = db.query(models.Diagnostico).filter(models.Diagnostico.id == diagnostico_id).first()
    paciente = db.query(models.Paciente).filter(models.Paciente.id == diagnostico.paciente_id).first()
    imagenes = db.query(models.Imagen).filter(models.Imagen.diagnostico_id == diagnostico_id).all()
    fecha = diagnostico.fecha_diagnostico.strftime('%Y-%m-%d')
    hora = diagnostico.fecha_diagnostico.strftime('%H:%M')

    if not diagnostico or not paciente or not imagenes:
        raise HTTPException(status_code=404, detail="Datos del diagnóstico incompletos")

    pdf = PDF()
    pdf.add_page()
    pdf.add_font("DejaVu", "", "app/fonts/DejaVuSans.ttf", uni=True)
    pdf.set_font("DejaVu", "", 12)
    pdf.set_text_color(0, 0, 0)

    pdf.set_fill_color(200, 220, 255)

    pdf.set_font("DejaVu", "", 12)
    pdf.cell(0, 10, "Datos Generales", ln=True, fill=True)
    pdf.ln(2)
    pdf.cell(0, 10, f"Paciente: {paciente.nombre} {paciente.apellido}", ln=True)
    pdf.cell(0, 10, f"Fecha del análisis: {fecha}", ln=True)
    pdf.cell(0, 10, f"Hora del análisis: {hora}", ln=True)
    pdf.ln(5)

    pdf.set_fill_color(200, 220, 255)

    pdf.set_font("DejaVu", "", 12)
    pdf.cell(0, 10, "Resultados del Diagnóstico", ln=True, fill=True)
    pdf.ln(2)

    etiquetas = [" ⋄ Benigno", " ⋄ C. Ductal", " ⋄ C. Lobulillar"]
    colores = [(102, 153, 255), (102, 153, 255), (102, 153, 255)]
    valores = [float(p.strip()) for p in diagnostico.resultado.split("-")]

    pdf.ln(3)
    bar_width = 120
    bar_height = 8
    x_start = pdf.get_x() + 40
    margin_y = 5

    for i, (etiqueta, valor) in enumerate(zip(etiquetas, valores)):
        pdf.set_text_color(0, 0, 0)
        pdf.cell(40, bar_height + 4, f"{etiqueta}:", ln=False)

        y = pdf.get_y()
        x = x_start

        pdf.set_draw_color(180, 180, 180)
        pdf.set_fill_color(255, 255, 255)
        pdf.rect(x, y, bar_width, bar_height, style="DF")

        fill_width = bar_width * (valor / 100)
        pdf.set_fill_color(*colores[i])
        pdf.rect(x, y, fill_width, bar_height, style="F")

        pdf.set_xy(x + bar_width + 2, y)
        pdf.cell(0, bar_height + 1, f"{valor:.2f}%", ln=True)

        pdf.ln(margin_y)

    pdf.multi_cell(0, 10, f"Descripción: {diagnostico.descripcion or 'Sin descripción registrada.'}")

    pdf.ln(5)

    if imagenes:
        pdf.ln(5)
        pdf.set_fill_color(200, 220, 255)
        pdf.cell(0, 10, "Imágenes Analizadas:", ln=True, fill=True)
        pdf.ln(3)

        for i, img in enumerate(imagenes):
            if os.path.exists(img.ruta_archivo):
                pdf.set_text_color(100, 100, 100)
                pdf.cell(0, 8, f"Imagen Analizada N°{i+1}", ln=True)
                pdf.ln(10)

                img_width = 100
                x = (pdf.w - img_width) / 2

                pdf.image(img.ruta_archivo, x=x, w=img_width)
                pdf.ln(20)

    os.makedirs("app/pdf_resultados", exist_ok=True)
    pdf_path = f"app/pdf_resultados/diagnostico_{diagnostico_id}.pdf"
    pdf.output(pdf_path)

    return FileResponse(pdf_path, media_type="application/pdf", filename=f"diagnostico_{diagnostico_id}.pdf")