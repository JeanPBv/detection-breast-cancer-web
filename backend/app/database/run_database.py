from app.database.database import Base, engine
from app.database.models import Paciente, Imagen, Diagnostico
# Crear las tablas en la BD (solo se ejecuta una vez)
Base.metadata.create_all(bind=engine)
