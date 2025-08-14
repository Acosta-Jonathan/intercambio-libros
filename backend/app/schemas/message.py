from pydantic import BaseModel
from datetime import datetime

class MessageBase(BaseModel):
    receiver_id: int
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
    is_read: bool

    class Config:
        orm_mode = True

class ConversationPreview(BaseModel):
    user_id: int
    username: str
    last_message: str
    last_timestamp: datetime

    class Config:
        orm_mode = True