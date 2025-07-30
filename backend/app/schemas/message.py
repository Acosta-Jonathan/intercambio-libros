# # app/schemas/message.py
# from pydantic import BaseModel, Field
# from datetime import datetime
# from typing import Optional

# class MessageBase(BaseModel):
#     content: str = Field(..., min_length=1, max_length=1000)
#     conversation_id: int

# class MessageCreate(MessageBase):
#     pass

# class MessageReadStatusUpdate(BaseModel):
#     read: bool

# class Message(MessageBase):
#     id: int
#     sender_id: int
#     receiver_id: int
#     timestamp: datetime
#     read: bool
#     delivered: bool
#     seen: bool

#     class Config:
#         from_attributes = True

# class MessageReadStatus(BaseModel):
#     message_id: int
#     user_id: int
#     read: bool

#     class Config:
#         from_attributes = True