# app/models/user.py
from sqlalchemy import Boolean, Column, Integer, String
from typing import Optional
from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str]
    telefono: Mapped[str] = mapped_column(String, nullable=True)  # ✅ corregido con Mapped
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    books = relationship("Book", back_populates="owner")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="[Message.sender_id]")
    received_messages = relationship("Message", back_populates="receiver", foreign_keys="[Message.receiver_id]")
    read_message_statuses = relationship("MessageReadStatus", back_populates="user")