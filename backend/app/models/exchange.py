# app/models/exchange.py

from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from app.database import Base

class Exchange(Base):
    __tablename__ = "exchanges"

    id = Column(Integer, primary_key=True, index=True)
    book_offered_id = Column(Integer, ForeignKey("books.id"))
    book_requested_id = Column(Integer, ForeignKey("books.id"))
    offering_user_id = Column(Integer, ForeignKey("users.id"))
    requesting_user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")  # "pending", "accepted", "rejected", "completed", "cancelled"
    created_at = Column(DateTime, default=func.now())

    offered_book_delivered = Column(Boolean, default=False)
    requested_book_delivered = Column(Boolean, default=False)

    book_offered = relationship("Book", foreign_keys=[book_offered_id])
    book_requested = relationship("Book", foreign_keys=[book_requested_id])
    offering_user = relationship("User", foreign_keys=[offering_user_id])
    requesting_user = relationship("User", foreign_keys=[requesting_user_id])

class ExchangeHistory(Base):
    __tablename__ = "exchange_history"

    id = Column(Integer, primary_key=True, index=True)
    exchange_id = Column(Integer, ForeignKey("exchanges.id"))
    completed_at = Column(DateTime, default=func.now())
