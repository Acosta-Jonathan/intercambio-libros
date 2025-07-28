# app/routers/books.py
import os
from uuid import uuid4
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app import models, schemas, security
from app.database import get_db
import logging


# Configuración del logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
router = APIRouter()

# Función para guardar imágenes
def save_image(file: UploadFile) -> str:
    extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid4().hex}{extension}"
    path = os.path.join("static", "images", filename)

    with open(path, "wb") as buffer:
        buffer.write(file.file.read())

    return f"/static/images/{filename}"

# Endpoint para crear el libro (sin imagen)
@router.post("/books/", response_model=schemas.Book)
def create_book(book: schemas.BookCreate, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_book = models.Book(**book.dict(), user_id=current_user.id)
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

# Endpoint para cargar la imagen del libro
@router.post("/books/{book_id}/image/", response_model=schemas.Book)
def upload_book_image(
    book_id: int,
    file: UploadFile = File(...),  # <- CAMBIO: usamos "file"
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    if db_book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    image_url = save_image(file)  # <- usamos "file"
    db_book.image_url = image_url
    db.commit()
    db.refresh(db_book)
    return db_book

@router.get("/books/", response_model=List[schemas.Book], description="Obtiene una lista de libros con opciones de búsqueda y filtrado.")
def read_books(skip: int = 0, limit: int = 100, title: Optional[str] = None, author: Optional[str] = None, publication_date: Optional[date] = None, category: Optional[str] = None, tags: Optional[str] = None, idioma: Optional[str] = None,
estado: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Book)
    if title:
        query = query.filter(models.Book.title.ilike(f"%{title}%"))
    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%"))
    if publication_date:
        query = query.filter(models.Book.publication_date == publication_date)
    if category:
        query = query.filter(models.Book.category.ilike(f"%{category}%"))
    if tags:
        query = query.filter(models.Book.tags.ilike(f"%{tags}%"))
    if idioma:
        query = query.filter(models.Book.idioma.ilike(f"%{idioma}%"))
    if estado:
        query = query.filter(models.Book.estado.ilike(f"%{estado}%"))
    books = query.offset(skip).limit(limit).all()
    return books
@router.get("/books/my-books", response_model=List[schemas.Book])
def read_my_books(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    books = db.query(models.Book).filter(models.Book.user_id == current_user.id).all()
    return books

@router.get("/books/{book_id}", response_model=schemas.Book)
def read_book(book_id: int, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if db_book is None:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return db_book

# ✅ PUT modificado para aceptar JSON plano desde Postman (application/json)
@router.put("/books/{book_id}", response_model=schemas.Book)
def update_book(book_id: int, book: schemas.BookUpdate, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if db_book is None:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    if db_book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    for key, value in book.dict(exclude_unset=True).items():
        setattr(db_book, key, value)
    db.commit()
    db.refresh(db_book)
    return db_book

@router.delete("/books/{book_id}", response_model=dict)
def delete_book(book_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if db_book is None:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    if db_book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    db.delete(db_book)
    db.commit()
    return {"message": "Libro borrado con éxito"}
