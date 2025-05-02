from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 🔧 Datos de conexión (ajusta a tus datos reales)
MYSQL_USER = "root"
MYSQL_PASSWORD = "mysql"
MYSQL_DB = "breast_cancer"
MYSQL_HOST = "localhost"

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"

# Crear motor y sesión
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
