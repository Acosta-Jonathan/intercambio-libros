# app/schemas/book.py

from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class BookBase(BaseModel):
 title: str
 author: str
 publication_date: date
 description: Optional[str] = None
 image_url: Optional[str] = None
 category: Optional[str] = None
 tags: Optional[str] = None
 idioma: Optional[str] = None
 estado: Optional[str] = None

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
 title: str
 author: str
 publication_date: date
 description: Optional[str] = None
 image_url: Optional[str] = None
 category: Optional[str] = None
 tags: Optional[str] = None
 idioma: Optional[str] = None
 estado: Optional[str] = None

class Book(BookBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
