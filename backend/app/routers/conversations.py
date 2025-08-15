from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from .. import models, schemas
from ..database import get_db
from app.security import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("/", response_model=List[schemas.conversation.ConversationOut])
def get_my_conversations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Obtiene todas las conversaciones del usuario actual con los últimos mensajes.
    """
    conversations = db.query(models.Conversation).filter(
        (models.Conversation.user1_id == current_user.id) |
        (models.Conversation.user2_id == current_user.id)
    ).all()

    result = []
    for convo in conversations:
        other = convo.user2 if convo.user1_id == current_user.id else convo.user1
        last_message = (
            db.query(models.Message)
            .filter(models.Message.conversation_id == convo.id)
            .order_by(models.Message.timestamp.desc())
            .first()
        )

        result.append(schemas.conversation.ConversationOut(
            id=convo.id,
            other_user_id=other.id,
            other_user_name=other.username,
            created_at=convo.created_at,
            last_message=last_message.content if last_message else None,
            last_message_time=last_message.timestamp if last_message else None
        ))

    result.sort(key=lambda x: x.last_message_time or x.created_at, reverse=True)

    return result

@router.post("/", response_model=schemas.conversation.ConversationOut)
def start_conversation(convo_data: schemas.conversation.ConversationCreate,
                       db: Session = Depends(get_db),
                       current_user: models.User = Depends(get_current_user)):
    """
    Inicia una nueva conversación con otro usuario o devuelve la existente.
    """
    if convo_data.receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes iniciar conversación contigo mismo.")

    existing = db.query(models.Conversation).filter(
        or_(
            (models.Conversation.user1_id == current_user.id) & (models.Conversation.user2_id == convo_data.receiver_id),
            (models.Conversation.user1_id == convo_data.receiver_id) & (models.Conversation.user2_id == current_user.id)
        )
    ).first()

    if existing:
        other = existing.user2 if existing.user1_id == current_user.id else existing.user1
        return schemas.conversation.ConversationOut(
            id=existing.id,
            other_user_id=other.id,
            other_user_name=other.username,
            created_at=existing.created_at
        )

    new_convo = models.Conversation(
        user1_id=current_user.id,
        user2_id=convo_data.receiver_id
    )
    db.add(new_convo)
    db.commit()
    db.refresh(new_convo)

    other = new_convo.user2
    return schemas.conversation.ConversationOut(
        id=new_convo.id,
        other_user_id=other.id,
        other_user_name=other.username,
        created_at=new_convo.created_at
    )