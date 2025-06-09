# app/models/book.py
from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship

from app.database import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String, index=True)
    publication_date = Column(Date)
    description = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String, nullable=True) 

    owner = relationship("User", back_populates="books")