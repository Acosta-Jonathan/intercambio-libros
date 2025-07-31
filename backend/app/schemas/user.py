# app/schemas/user.py
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional # Importar Optional

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=50, pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    telefono: Optional[str] = Field(
        default=None,
        min_length=10,
        pattern=r'^\d{10,}$',
        description="Solo números, mínimo 10 dígitos"
    )

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool = False
    # Si User tiene relaciones (como sent_messages, read_message_statuses)
    # y quieres que Pydantic las incluya al serializar, necesitarías definirlas aquí
    # Por ejemplo, si los mensajes fueran un modelo con Pydantic:
    # sent_messages: List['MessageSchema'] = [] # Asumiendo que 'MessageSchema' es un esquema para mensajes

    class Config:
        from_attributes = True # O orm_mode = True para versiones antiguas de Pydantic

# MODIFICACIÓN CLAVE AQUÍ:
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User # <-- ¡Agrega esto! La respuesta del login ahora incluirá el objeto User

class TokenPayload(BaseModel):
    sub: str
    
class ChangePassword(BaseModel):
    old_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)

class UpdateTelefono(BaseModel):
    telefono: str = Field(..., min_length=10, pattern=r'^\d{10,}$')

    model_config = ConfigDict(from_attributes=True)