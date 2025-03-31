from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app import models, schemas, security
from app.database import get_db
from main import sio

router = APIRouter()

@router.post("/messages/", response_model=schemas.Message)
def create_message(message: schemas.MessageCreate, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_message = models.Message(**message.dict(), sender_id=current_user.id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    sio.emit("new_message", message.dict(), room=message.receiver_id) #emitimos el mensaje a la sala del receptor
    return db_message

@router.get("/messages/{conversation_id}", response_model=List[schemas.Message])
def read_messages(
    conversation_id: int,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, description="Número de mensajes a omitir"),
    limit: int = Query(10, description="Número máximo de mensajes a devolver"),
    start_date: Optional[datetime] = Query(None, description="Fecha de inicio para filtrar mensajes"),
    end_date: Optional[datetime] = Query(None, description="Fecha de fin para filtrar mensajes"),
    sender_id: Optional[int] = Query(None, description="ID del remitente para filtrar mensajes"),
    receiver_id: Optional[int] = Query(None, description="ID del destinatario para filtrar mensajes"),
):
    query = db.query(models.Message).filter(models.Message.conversation_id == conversation_id)

    if start_date:
        query = query.filter(models.Message.timestamp >= start_date)
    if end_date:
        query = query.filter(models.Message.timestamp <= end_date)
    if sender_id:
        query = query.filter(models.Message.sender_id == sender_id)
    if receiver_id:
        query = query.filter(models.Message.receiver_id == receiver_id)

    messages = query.offset(skip).limit(limit).all()
    return messages

@router.put("/messages/{message_id}/read/", response_model=schemas.Message)
def mark_message_as_read(message_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if db_message.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para marcar este mensaje como leído")
    db_message.read = True
    db.commit()
    db.refresh(db_message)
    return db_message

@router.put("/messages/{message_id}/read/", response_model=schemas.Message)
def mark_message_as_read(message_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if db_message.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para marcar este mensaje como leído")

    # Verificar si ya existe un registro de lectura para este usuario y mensaje
    db_read_status = db.query(models.MessageReadStatus).filter(
        models.MessageReadStatus.message_id == message_id,
        models.MessageReadStatus.user_id == current_user.id
    ).first()

    if db_read_status:
        # Actualizar el registro existente
        db_read_status.read = True
    else:
        # Crear un nuevo registro de lectura
        db_read_status = models.MessageReadStatus(message_id=message_id, user_id=current_user.id, read=True)
        db.add(db_read_status)

    db.commit()
    db.refresh(db_message)
    return db_message

@router.put("/messages/{message_id}/delivered/", response_model=schemas.Message)
def mark_message_as_delivered(message_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if db_message.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para marcar este mensaje como entregado")
    db_message.delivered = True
    db.commit()
    db.refresh(db_message)
    return db_message

@router.put("/messages/{message_id}/seen/", response_model=schemas.Message)
def mark_message_as_seen(message_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if db_message.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para marcar este mensaje como visto")
    db_message.seen = True
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/conversations/{conversation_id}/messages/search/", response_model=List[schemas.Message])
def search_conversation_messages(
    conversation_id: int,
    query: str = Query(..., description="Texto de búsqueda"),
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    if conversation.user1_id != current_user.id and conversation.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para ver esta conversación")

    messages = db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id,
        models.Message.content.ilike(f"%{query}%")
    ).all()
    return messages

@router.websocket("/ws/{conversation_id}")
async def websocket_endpoint(websocket: WebSocket, conversation_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message = schemas.MessageCreate(content=data, conversation_id=conversation_id)
            db_message = models.Message(**message.dict(), sender_id=current_user.id)
            db.add(db_message)
            db.commit()
            db.refresh(db_message)
            await websocket.send_text(f"Message text was: {data}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        websocket.close()