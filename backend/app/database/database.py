from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import databases
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv(dotenv_path=r"D:\Trabajo final TUP\intercambio-libros\.env")

# URL de conexión a PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")

# Conexión síncrona
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Conexión asíncrona
database = databases.Database(DATABASE_URL)

# Base para los modelos
Base = declarative_base()
# Verificar conexión
try:
    # Intentamos obtener una sesión de la base de datos
    with engine.connect() as connection:
        print("Conexión exitosa a la base de datos")
except Exception as e:
    print(f"Error al conectar a la base de datos: {e}")