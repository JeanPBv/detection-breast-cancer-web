from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app import schemas, crud

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.PacienteOut)
def registrar_paciente(paciente: schemas.PacienteCreate, db: Session = Depends(get_db)):
    return crud.crear_paciente(db, paciente)

@router.get("/lista/", response_model=list[schemas.PacienteOut])
def listar_pacientes(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.obtener_pacientes(db, skip=skip, limit=limit)

@router.get("/{paciente_id}", response_model=schemas.PacienteOut)
def get_paciente(paciente_id: int, db: Session = Depends(get_db)):
    paciente = crud.obtener_paciente_por_id(db, paciente_id)
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return paciente

@router.put("/{paciente_id}", response_model=schemas.PacienteOut)
def put_paciente(paciente_id: int, datos: schemas.PacienteCreate, db: Session = Depends(get_db)):
    paciente = crud.actualizar_paciente(db, paciente_id, datos)
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return paciente
