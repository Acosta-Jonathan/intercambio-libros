# app/models/user.py
from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    books = relationship("Book", back_populates="owner")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="[Message.sender_id]")
    # --- OPCIONAL: Relación para mensajes recibidos ---
    # Si quieres esta relación inversa en User, añádela aquí
    received_messages = relationship("Message", back_populates="receiver", foreign_keys="[Message.receiver_id]")
    # ------------------------------------------------
    read_message_statuses = relationship("MessageReadStatus", back_populates="user")