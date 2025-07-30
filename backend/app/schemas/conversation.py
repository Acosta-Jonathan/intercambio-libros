# # app/schemas/conversation.py
# from pydantic import BaseModel
# from typing import Optional
# from datetime import datetime

# from .user import User

# class ConversationBase(BaseModel):
#     user2_id: int

# class ConversationCreate(ConversationBase):
#     pass 

# class Conversation(BaseModel): 
#     id: int
#     user1_id: int
#     user2_id: int
    
#     last_message_timestamp: datetime 
    
#     other_user: Optional[User] = None
    
#     last_message_content: Optional[str] = None 

#     class Config:
#         from_attributes = True