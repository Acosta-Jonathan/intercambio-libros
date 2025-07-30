# app/schemas/conversation.py
from pydantic import BaseModel
from typing import Optional # Necesario para Optional
from datetime import datetime # Necesario para datetime

# Asegúrate de importar tu esquema de usuario si lo tienes.
# Por ejemplo, si User está en schemas/user.py
from .user import User # Suponiendo que tienes un esquema User detallado aquí

class ConversationBase(BaseModel):
    # Esto puede usarse para iniciar una conversación,
    # donde solo necesitas saber con quién quieres chatear
    user2_id: int

class ConversationCreate(ConversationBase):
    pass # Si necesitas campos adicionales para crear, los pondrías aquí

class Conversation(BaseModel): # <-- Recomiendo no heredar de ConversationBase aquí para más control
    id: int
    user1_id: int
    user2_id: int
    
    last_message_timestamp: datetime # Para ordenar y mostrar la última actividad
    
    # Añadimos el 'other_user' para que el frontend sepa con quién es la conversación
    # 'User' sería tu esquema de usuario con id, username, email, etc.
    other_user: Optional[User] = None # <-- ¡CRUCIAL para el frontend!
    
    # Opcional: un pequeño fragmento del último mensaje para mostrar en la lista
    last_message_content: Optional[str] = None 

    class Config:
        from_attributes = True