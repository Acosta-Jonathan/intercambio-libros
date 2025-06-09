# app/schemas/exchange.py
from pydantic import BaseModel
from datetime import datetime

class ExchangeBase(BaseModel):
    book_offered_id: int
    book_requested_id: int

class ExchangeCreate(ExchangeBase):
    pass

class ExchangeUpdate(BaseModel):
    status: str

class Exchange(ExchangeBase):
    id: int
    offering_user_id: int
    requesting_user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
        
class ExchangeHistory(BaseModel):
    id: int
    exchange_id: int
    completed_at: datetime

    class Config:
        from_attributes = True