from pydantic import BaseModel
from datetime import datetime

class PacienteCreate(BaseModel):
    nombre: str
    apellido: str
    dni: str
    edad: int
    sexo: str

class PacienteOut(PacienteCreate):
    id: int
    fecha_registro: datetime

    class Config:
        from_attributes=True