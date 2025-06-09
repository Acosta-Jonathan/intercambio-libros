# app/schemas/book.py
from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    author: str = Field(..., min_length=1, max_length=100)
    publication_date: date
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = Field(None)

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True