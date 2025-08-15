from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict
from app import models, schemas
from app.security import get_current_user, get_db, verify_access_token

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)

# --- REST para historial ---
@router.post("/", response_model=schemas.message.MessageResponse)
def send_message(message: schemas.message.MessageCreate, db: Session = Depends(get_db), current_user: models.user.User = Depends(get_current_user)):
    new_message = models.message.Message(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        content=message.content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message

@router.get("/conversation/{user_id}", response_model=List[schemas.message.MessageResponse])
def get_conversation(user_id: int, db: Session = Depends(get_db), current_user: models.user.User = Depends(get_current_user)):
    messages = db.query(models.message.Message).filter(
        ((models.message.Message.sender_id == current_user.id) & (models.message.Message.receiver_id == user_id)) |
        ((models.message.Message.sender_id == user_id) & (models.message.Message.receiver_id == current_user.id))
    ).order_by(models.message.Message.timestamp.asc()).all()
    return messages

# --- WebSocket para chat en tiempo real ---
active_connections: Dict[int, WebSocket] = {}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """
    Gestiona la conexión WebSocket para el chat en tiempo real.
    """
    try:
        username = verify_access_token(token)
    except HTTPException:
        await websocket.close(code=status.HTTP_401_UNAUTHORIZED)
        return
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        await websocket.close(code=status.HTTP_401_UNAUTHORIZED)
        return

    await websocket.accept()
    active_connections[user.id] = websocket

    try:
        while True:
            data = await websocket.receive_json()
            receiver_id = data.get("receiver_id")
            content = data.get("content")

            if not receiver_id or not content:
                continue

            # Buscar o crear la conversación.
            conversation = db.query(models.Conversation).filter(
                or_(
                    (models.Conversation.user1_id == user.id) & (models.Conversation.user2_id == receiver_id),
                    (models.Conversation.user1_id == receiver_id) & (models.Conversation.user2_id == user.id)
                )
            ).first()

            if not conversation:
                new_convo = models.Conversation(
                    user1_id=user.id,
                    user2_id=receiver_id
                )
                db.add(new_convo)
                db.commit()
                db.refresh(new_convo)
                conversation = new_convo

            # Crear el nuevo mensaje con el conversation_id
            new_message = models.Message(
                sender_id=user.id,
                receiver_id=receiver_id,
                content=content,
                conversation_id=conversation.id  # Asignamos el ID de la conversación aquí
            )
            db.add(new_message)
            db.commit()
            db.refresh(new_message)

            # Si el receptor está conectado, le enviamos el mensaje
            if receiver_id in active_connections:
                await active_connections[receiver_id].send_json({
                    "id": new_message.id,
                    "sender_id": user.id,
                    "receiver_id": receiver_id,
                    "content": content,
                    "timestamp": new_message.timestamp.isoformat(),
                    "is_read": False,
                    "conversation_id": new_message.conversation_id
                })
            
            # También enviamos el mensaje al emisor para que se refleje en su UI
            await active_connections[user.id].send_json({
                "id": new_message.id,
                "sender_id": user.id,
                "receiver_id": receiver_id,
                "content": content,
                "timestamp": new_message.timestamp.isoformat(),
                "is_read": False,
                "conversation_id": new_message.conversation_id
            })

    except WebSocketDisconnect:
        # La conexión se cierra, eliminamos el usuario de las conexiones activas
        active_connections.pop(user.id, None)
    except Exception as e:
        # Manejo de cualquier otra excepción para evitar que el proceso se detenga
        print(f"Error inesperado en WebSocket: {e}")
        active_connections.pop(user.id, None)
        await websocket.close(code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/partners", response_model=List[schemas.message.ConversationPreview])
def get_conversation_partners(
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(get_current_user)
):
    """
    Devuelve los usuarios con los que el current_user tiene mensajes,
    con el último mensaje y su timestamp para armar la lista de conversaciones.
    """
    msgs = (
        db.query(models.message.Message)
        .filter(
            or_(
                models.message.Message.sender_id == current_user.id,
                models.message.Message.receiver_id == current_user.id,
            )
        )
        .order_by(models.message.Message.timestamp.desc())
        .all()
    )

    # Tomamos el más reciente por cada "otro usuario"
    latest_by_other: Dict[int, models.message.Message] = {}
    for m in msgs:
        other_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
        if other_id not in latest_by_other:
            latest_by_other[other_id] = m

    if not latest_by_other:
        return []

    other_ids = list(latest_by_other.keys())
    users = db.query(models.user.User).filter(models.user.User.id.in_(other_ids)).all()
    users_map = {u.id: u for u in users}

    previews = []
    for other_id, m in latest_by_other.items():
        u = users_map.get(other_id)
        previews.append(
            schemas.message.ConversationPreview(
                user_id=other_id,
                username=u.username if u else f"Usuario {other_id}",
                last_message=m.content,
                last_timestamp=m.timestamp,
            )
        )
    # Opcional: orden por timestamp (ya vienen desc, pero por si acaso)
    previews.sort(key=lambda x: x.last_timestamp, reverse=True)
    return previews