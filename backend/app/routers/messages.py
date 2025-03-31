from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, security
from app.database import get_db

router = APIRouter()

@router.post("/messages/", response_model=schemas.Message)
def create_message(message: schemas.MessageCreate, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_message = models.Message(**message.dict(), sender_id=current_user.id) #Modificamos la importación
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/messages/", response_model=List[schemas.Message])
def read_messages(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    messages = db.query(models.Message).filter( #Modificamos la importación
        (models.Message.sender_id == current_user.id) | (models.Message.receiver_id == current_user.id) #Modificamos la importación
    ).all()
    return messages

@router.get("/messages/{message_id}", response_model=schemas.Message)
def read_message(message_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    message = db.query(models.Message).filter(models.Message.id == message_id).first() #Modificamos la importación
    if not message:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if message.sender_id != current_user.id and message.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para ver este mensaje")
    return message