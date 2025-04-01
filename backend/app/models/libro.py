from sqlalchemy import Column, Integer, String
from database.database import Base
from pydantic import BaseModel

# Modelo SQLAlchemy
class Libro(Base):
    __tablename__ = 'libros'

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    autor = Column(String)
    descripcion = Column(String)

# Modelos Pydantic

# Base para compartir las validaciones
class LibroBase(BaseModel):
    titulo: str
    autor: str
    descripcion: str

    class Config:
        orm_mode = True  # Permite que Pydantic trabaje con modelos de SQLAlchemy

# Para la creación de un libro
class LibroCreate(LibroBase):
    pass

# Para la respuesta con el ID del libro (cambiamos el nombre de la clase)
class LibroResponse(LibroBase):
    id: int

    class Config:
        orm_mode = True