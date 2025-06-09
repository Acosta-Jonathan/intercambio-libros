# app/routers/conversations.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, security
from app.database import get_db

router = APIRouter()

@router.post("/conversations/", response_model=schemas.Conversation)
def create_conversation(conversation: schemas.ConversationBase, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_conversation = models.Conversation(user1_id=current_user.id, user2_id=conversation.user2_id)
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

@router.get("/conversations/", response_model=List[schemas.Conversation])
def read_conversations(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    conversations = db.query(models.Conversation).filter(
        (models.Conversation.user1_id == current_user.id) | (models.Conversation.user2_id == current_user.id)
    ).all()
    return conversations

@router.get("/conversations/{conversation_id}/messages/", response_model=List[schemas.Message])
def get_conversation_messages(
    conversation_id: int,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    if conversation.user1_id != current_user.id and conversation.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para ver esta conversación")

    messages = db.query(models.Message).filter(models.Message.conversation_id == conversation_id).all()
    return messages