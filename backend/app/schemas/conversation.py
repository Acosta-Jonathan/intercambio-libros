from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ConversationBase(BaseModel):
    user1_id: int
    user2_id: int

class ConversationCreate(BaseModel):
    receiver_id: int

class ConversationOut(BaseModel):
    id: int
    other_user_id: int
    other_user_name: str
    created_at: datetime
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None

    class Config:
        orm_mode = True
