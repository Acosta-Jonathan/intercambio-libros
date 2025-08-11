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
    # 1. Obtiene los nombres de las categorías del request
    category_names = book.categories
    
    # 2. Busca o crea las categorías en la base de datos
    categories = []
    for name in category_names:
        # Busca si la categoría ya existe (la búsqueda es insensible a mayúsculas/minúsculas)
        category = db.query(models.Category).filter(models.Category.name.ilike(name)).first()
        if not category:
            # Si no existe, la crea
            category = models.Category(name=name)
            db.add(category)
            db.commit()
            db.refresh(category)
        categories.append(category)

    # 3. Crea el libro con los datos recibidos, excluyendo el campo 'categories'
    #    ya que lo manejaremos por separado
    book_data = book.dict(exclude={"categories"})
    db_book = models.Book(**book_data, user_id=current_user.id)
    
    # 4. Asocia las categorías al libro
    db_book.categories = categories
    
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    
    return db_book

# Endpoint para cargar la imagen del libro
@router.post("/books/{book_id}/image/", response_model=schemas.Book)
def upload_book_image(
    book_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    if db_book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    image_url = save_image(file)
    db_book.image_url = image_url
    db.commit()
    db.refresh(db_book)
    return db_book

@router.get("/books/", response_model=List[schemas.Book], description="Obtiene una lista de libros con opciones de búsqueda y filtrado.")
def read_books(
    skip: int = 0, limit: int = 100,
    title: Optional[str] = None,
    author: Optional[str] = None,
    publication_date: Optional[date] = None,
    editorial: Optional[str] = None,
    edicion: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[str] = None,
    idioma: Optional[str] = None,
    estado: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Book)
    if title:
        query = query.filter(models.Book.title.ilike(f"%{title}%"))
    if author:
        query = query.filter(models.Book.author.ilike(f"%{author}%"))
    if publication_date:
        query = query.filter(models.Book.publication_date == publication_date)
    if editorial:
        query = query.filter(models.Book.editorial.ilike(f"%{editorial}%"))
    if edicion:
        query = query.filter(models.Book.edicion.ilike(f"%{edicion}%"))
    if category:
        # Lógica para filtrar por categoría
        query = query.join(models.Book.categories).filter(models.Category.name.ilike(f"%{category}%"))
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

    # Si hay categorías en la actualización, las procesamos
    if book.categories is not None:
        category_names = book.categories
        categories = []
        for name in category_names:
            category = db.query(models.Category).filter(models.Category.name.ilike(name)).first()
            if not category:
                # Si no existe, la crea
                category = models.Category(name=name)
                db.add(category)
                db.commit()
                db.refresh(category)
            categories.append(category)
        db_book.categories = categories # Asocia las nuevas categorías al libro
        
    # Actualiza el resto de los campos
    for key, value in book.dict(exclude_unset=True, exclude={"categories"}).items():
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

@router.put("/books/{book_id}/upload-image", response_model=schemas.Book)
def update_book_image(
    book_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    if db_book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    image_url = save_image(file)
    db_book.image_url = image_url
    db.commit()
    db.refresh(db_book)
    return db_book