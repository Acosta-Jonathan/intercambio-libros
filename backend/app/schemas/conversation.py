from pydantic import BaseModel

class ConversationBase(BaseModel):
    user2_id: int

class Conversation(ConversationBase):
    id: int
    user1_id: int

    class Config:
        from_attributes = True