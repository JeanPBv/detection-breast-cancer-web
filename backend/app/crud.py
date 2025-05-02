from sqlalchemy.orm import Session
from app import schemas
from app.database import models
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

def crear_paciente(db: Session, paciente: schemas.PacienteCreate):
    db_paciente = models.Paciente(**paciente.model_dump())
    db.add(db_paciente)
    try:
        db.commit()
        db.refresh(db_paciente)
        return db_paciente
    except IntegrityError as e:
        db.rollback()
        if "Duplicate entry" in str(e.orig) and "dni" in str(e.orig):
            raise HTTPException(status_code=400, detail="DNI_DUPLICADO")
        raise HTTPException(status_code=500, detail="ERROR_INTERNO")
    
def obtener_pacientes(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Paciente).offset(skip).limit(limit).all()

def obtener_paciente_por_id(db: Session, paciente_id: int):
    return db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()

def actualizar_paciente(db: Session, paciente_id: int, datos: schemas.PacienteCreate):
    paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    for attr, value in datos.model_dump().items():
        setattr(paciente, attr, value)

    try:
        db.commit()
        db.refresh(paciente)
        return paciente
    except IntegrityError as e:
        db.rollback()
        if "Duplicate entry" in str(e.orig) and "dni" in str(e.orig):
            raise HTTPException(status_code=400, detail="DNI_DUPLICADO")
        raise HTTPException(status_code=500, detail="ERROR_INTERNO")