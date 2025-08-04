from sqlalchemy import Column, Integer, String, ForeignKey, Date, Table
from sqlalchemy.orm import relationship

from app.database import Base

# Tabla asociativa para libros y categorías
books_categories = Table(
    'books_categories',
    Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String, index=True)
    publication_date = Column(Date)
    description = Column(String)
    image_url = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    idioma = Column(String, nullable=True)
    estado = Column(String, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="books")
    categories = relationship("Category", secondary=books_categories, back_populates="books")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    books = relationship("Book", secondary=books_categories, back_populates="categories")