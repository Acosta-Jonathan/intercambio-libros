# app/models/message.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

# Asegúrate de que esta importación sea correcta para donde resides tu Base
from app.database import Base 

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id")) # Asumo que "users" es el nombre de la tabla de usuarios
    conversation_id = Column(Integer, ForeignKey("conversations.id")) # Asumo que "conversations" es el nombre de la tabla de conversaciones
    
    # --- NUEVO CAMPO: receiver_id ---
    receiver_id = Column(Integer, ForeignKey("users.id"))
    # -------------------------------
    
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)
    delivered = Column(Boolean, default=False)
    seen = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    conversation = relationship("Conversation", back_populates="messages")
    read_statuses = relationship("MessageReadStatus", back_populates="message")
    
    # --- NUEVA RELACIÓN para receiver_id ---
    # Si tienes una relación "received_messages" en el modelo User, añádela aquí
    receiver = relationship("User", foreign_keys=[receiver_id])
    # -----------------------------------

# Asegúrate de que MessageReadStatus y cualquier otra clase que esté en este archivo
# también se adapte si es necesario. Basado en tu provisión, MessageReadStatus no necesita cambios.
class MessageReadStatus(Base):
    __tablename__ = "message_read_statuses"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    read = Column(Boolean, default=False)

    message = relationship("Message", back_populates="read_statuses")
    user = relationship("User", back_populates="read_message_statuses")