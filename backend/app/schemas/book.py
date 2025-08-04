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
        orm_mode = True

class BookBase(BaseModel):
    title: str
    author: str
    publication_date: Optional[date] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None
    idioma: Optional[str] = None
    estado: Optional[str] = None

class BookCreate(BookBase):
    # Recibe una lista de ids de categorías
    categories: List[str]
    
class BookUpdate(BaseModel):
    title: str
    author: str
    publication_date: Optional[date] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    categories: Optional[List[str]] = None
    tags: Optional[str] = None
    idioma: Optional[str] = None
    estado: Optional[str] = None

class Book(BookBase):
    id: int
    user_id: int
    categories: List[Category]

    class Config:
        orm_mode = True