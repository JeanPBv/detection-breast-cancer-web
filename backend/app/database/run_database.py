from app.database.database import Base, engine
from app.database.models import Paciente, Imagen, Diagnostico

#RECORDAR: SOLO EJECUTAR ESTE ARCHIVO UNA SOLA VEZ
Base.metadata.create_all(bind=engine)
