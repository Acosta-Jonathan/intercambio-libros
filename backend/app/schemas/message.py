from pydantic import BaseModel
from datetime import datetime

class MessageBase(BaseModel):
    content: str
    conversation_id: int

class MessageCreate(MessageBase):
    pass

class MessageReadStatusUpdate(BaseModel):
    read: bool

class Message(MessageBase):
    id: int
    sender_id: int
    timestamp: datetime
    read: bool
    delivered: bool
    seen: bool

    class Config:
        from_attributes = True

class MessageReadStatus(BaseModel):
    message_id: int
    user_id: int
    read: bool

    class Config:
        from_attributes = True