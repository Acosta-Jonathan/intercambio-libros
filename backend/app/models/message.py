## app/models/message.py
# from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
# from sqlalchemy.orm import relationship
# from datetime import datetime

# from app.database import Base

# class Message(Base):
#     __tablename__ = "messages"

#     id = Column(Integer, primary_key=True, index=True)
#     sender_id = Column(Integer, ForeignKey("users.id"))
#     conversation_id = Column(Integer, ForeignKey("conversations.id"))
    
#     receiver_id = Column(Integer, ForeignKey("users.id"))
    
#     content = Column(String)
#     timestamp = Column(DateTime, default=datetime.utcnow)
#     read = Column(Boolean, default=False)
#     delivered = Column(Boolean, default=False)
#     seen = Column(Boolean, default=False)

#     sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
#     conversation = relationship("Conversation", back_populates="messages")
#     read_statuses = relationship("MessageReadStatus", back_populates="message")
    
#     receiver = relationship("User", foreign_keys=[receiver_id])
    
# class MessageReadStatus(Base):
#     __tablename__ = "message_read_statuses"

#     id = Column(Integer, primary_key=True, index=True)
#     message_id = Column(Integer, ForeignKey("messages.id"))
#     user_id = Column(Integer, ForeignKey("users.id"))
#     read = Column(Boolean, default=False)

#     message = relationship("Message", back_populates="read_statuses")
#     user = relationship("User", back_populates="read_message_statuses")