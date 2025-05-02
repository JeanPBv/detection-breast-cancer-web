from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base

class Paciente(Base):
    __tablename__ = "pacientes"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    apellido = Column(String(100))
    dni = Column(String(8), unique=True)
    edad = Column(Integer)
    sexo = Column(String(10))
    fecha_registro = Column(DateTime, default=datetime.utcnow)

    diagnosticos = relationship("Diagnostico", back_populates="paciente")


class Imagen(Base):
    __tablename__ = "imagenes"

    id = Column(Integer, primary_key=True, index=True)
    ruta_archivo = Column(String(200))
    fecha_subida = Column(DateTime, default=datetime.utcnow)
    diagnostico_id = Column(Integer, ForeignKey("diagnosticos.id"))

    diagnostico = relationship("Diagnostico", back_populates="imagenes")

class Diagnostico(Base):
    __tablename__ = "diagnosticos"
    
    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))
    resultado = Column(String(20))
    descripcion = Column(String(5000))
    fecha_diagnostico = Column(DateTime, default=datetime.utcnow)

    paciente = relationship("Paciente", back_populates="diagnosticos")
    imagenes = relationship("Imagen", back_populates="diagnostico")