# app/models/libro.py

from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Libro(Base):
    __tablename__ = "libros"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    autor = Column(String, nullable=False)
    descripcion = Column(String)
    fecha_publicacion = Column(Date, nullable=False)
    imagen_url = Column(String)
    categoria = Column(String)
    etiquetas = Column(String)
    idioma = Column(String)
    estado = Column(String)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))

    usuario = relationship("Usuario", back_populates="libros")
