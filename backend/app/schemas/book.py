# app/schemas/book.py
from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Esquema base con todos los campos del libro
class BookBase(BaseModel):
    title: str
    author: str
    publication_date: Optional[int] = None
    editorial: Optional[str] = None
    edicion: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None
    idioma: Optional[str] = None
    estado: Optional[str] = None

# Esquema para crear un libro. Hereda de BookBase.
class BookCreate(BookBase):
    # Recibe una lista de nombres de categorías
    categories: List[str]

# Esquema para actualizar un libro. Hereda de BookBase y hace todos los campos opcionales.
class BookUpdate(BookBase):
    title: Optional[str] = None
    author: Optional[str] = None
    publication_date: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    categories: Optional[List[str]] = None
    tags: Optional[str] = None
    idioma: Optional[str] = None
    estado: Optional[str] = None
    
# Esquema para la respuesta de la API. Hereda de BookBase.
class Book(BookBase):
    id: int
    user_id: int
    categories: List[Category]

    class Config:
        from_attributes = True