# routers/messages.py
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, Query
from sqlalchemy.orm import Session, joinedload # Importamos joinedload para cargar relaciones
from typing import List, Optional
from datetime import datetime

from app import models, schemas, security # Asegúrate de que security.get_current_user es tu dependencia para el usuario autenticado
from app.database import get_db
from app.socket_manager import sio # Asegúrate de que tu instancia de socketio está configurada y accesible

router = APIRouter()

@router.post("/messages/", response_model=schemas.Message)
def create_message(
    message: schemas.MessageCreate,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == message.conversation_id,
        (models.Conversation.user1_id == current_user.id) | (models.Conversation.user2_id == current_user.id)
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada o no autorizado")

    receiver_id = conversation.user1_id if conversation.user2_id == current_user.id else conversation.user2_id
    db_message = models.Message(
        content=message.content,
        conversation_id=message.conversation_id,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        read=False,
        delivered=False,
        seen=False
    )
    db.add(db_message)
    conversation.last_message_timestamp = datetime.utcnow()
    db.commit()
    db.refresh(db_message)
    
    sio.emit("new_message", schemas.Message.from_orm(db_message).dict(), room=str(receiver_id))

    return db_message

# --- Endpoint para obtener mensajes de una conversación específica ---
@router.get("/conversations/{conversation_id}/messages/", response_model=List[schemas.Message])
def read_messages_in_conversation(
    conversation_id: int,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, description="Número de mensajes a omitir"),
    limit: int = Query(100, description="Número máximo de mensajes a devolver"),
):
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        (models.Conversation.user1_id == current_user.id) | (models.Conversation.user2_id == current_user.id)
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada o no autorizado")

    messages = db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(models.Message.timestamp).offset(skip).limit(limit).all()
    return messages

@router.get("/conversations/", response_model=List[schemas.Conversation])
def get_user_conversations(
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    conversations = db.query(models.Conversation).filter(
        (models.Conversation.user1_id == current_user.id) | (models.Conversation.user2_id == current_user.id)
    ).options(
        joinedload(models.Conversation.user1),
        joinedload(models.Conversation.user2)
    ).all()

    # Mapear los objetos de SQLAlchemy a los esquemas de Pydantic
    # y rellenar los campos 'other_user' y 'last_message_content'
    result = []
    for conv in conversations:
        other_user_model = None
        if conv.user1_id == current_user.id:
            # Si el usuario actual es user1, el otro usuario es user2
            other_user_model = conv.user2
        elif conv.user2_id == current_user.id:
            # Si el usuario actual es user2, el otro usuario es user1
            other_user_model = conv.user1
        
        # Opcional: Obtener el contenido del último mensaje para mostrar un snippet
        # Esto puede ser una consulta N+1 si no se hace con cuidado en grandes volúmenes.
        # Si el rendimiento es un problema, considera almacenar last_message_content en el modelo Conversation.
        last_message = db.query(models.Message).filter(
            models.Message.conversation_id == conv.id
        ).order_by(models.Message.timestamp.desc()).first()

        result.append(schemas.Conversation(
            id=conv.id,
            user1_id=conv.user1_id,
            user2_id=conv.user2_id,
            last_message_timestamp=conv.last_message_timestamp, # Asegúrate de que tu modelo Conversation tenga este campo
            other_user=schemas.User.from_orm(other_user_model) if other_user_model else None,
            last_message_content=last_message.content if last_message else None
        ))
    return result

@router.put("/messages/{message_id}/read/", response_model=schemas.Message)
def mark_message_as_read(
    message_id: int,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    # Validar si el usuario actual es el RECEPTOR del mensaje
    if db_message.receiver_id != current_user.id: # <-- ¡VERIFICA ESTO!
        raise HTTPException(status_code=403, detail="No autorizado para marcar este mensaje como leído")

    db_message.read = True
    
    db.commit()
    db.refresh(db_message)
    return db_message

@router.put("/messages/{message_id}/delivered/", response_model=schemas.Message)
def mark_message_as_delivered(
    message_id: int,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if db_message.receiver_id != current_user.id: # <-- ¡VERIFICA ESTO!
        raise HTTPException(status_code=403, detail="No autorizado para marcar este mensaje como entregado")
    db_message.delivered = True
    db.commit()
    db.refresh(db_message)
    return db_message

@router.put("/messages/{message_id}/seen/", response_model=schemas.Message)
def mark_message_as_seen(
    message_id: int,
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    db_message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if db_message.receiver_id != current_user.id: # <-- ¡VERIFICA ESTO!
        raise HTTPException(status_code=403, detail="No autorizado para marcar este mensaje como visto")
    db_message.seen = True
    db.commit()
    db.refresh(db_message)
    return db_message

# --- Endpoint de búsqueda de mensajes en conversación (MANTENIDO) ---
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


@router.websocket("/conversations/{conversation_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: int,
    current_user: models.User = Depends(security.get_current_user), # Asegúrate de que esta dependencia funcione para WebSockets
    db: Session = Depends(get_db)
):
    # Verificar que el usuario actual es parte de la conversación
    conversation = db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id,
        (models.Conversation.user1_id == current_user.id) | (models.Conversation.user2_id == current_user.id)
    ).first()
    if not conversation:
        # En WebSocket, no puedes lanzar HTTPException así, necesitas cerrar la conexión
        print(f"WebSocket: User {current_user.id} not authorized for conversation {conversation_id}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION) # Código para no autorizado
        return

    # Unirse a una "sala" específica de Socket.IO para esta conversación
    # Asegúrate de que tu `sio` maneje las salas correctamente (ej. 'conversation_<id>')
    # await sio.enter_room(websocket.sid, str(conversation_id)) # Si usas python-socketio y necesitas gestionar sid explícitamente

    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Crear y guardar el mensaje en la BD
            message_create_schema = schemas.MessageCreate(content=data, conversation_id=conversation_id)
            
            receiver_id_for_ws = conversation.user1_id if conversation.user2_id == current_user.id else conversation.user2_id

            db_message = models.Message(
                **message_create_schema.dict(),
                sender_id=current_user.id,
                receiver_id=receiver_id_for_ws,
                read=False, delivered=False, seen=False
            )
            db.add(db_message)
            conversation.last_message_timestamp = datetime.utcnow()
            db.commit()
            db.refresh(db_message)

            sio.emit("new_message", db_message.dict(), room=str(conversation_id)) 

    except Exception as e:
        print(f"WebSocket error in conversation {conversation_id} for user {current_user.id}: {e}")
    finally:
        await websocket.close()
        

# --- ENDPOINT TEMPORAL PARA CREAR UNA CONVERSACIÓN (¡QUITAR O PROTEGER EN PRODUCCIÓN!) ---
@router.post("/conversations/", response_model=schemas.Conversation, status_code=status.HTTP_201_CREATED)
def create_conversation_debug(
    conv_create: schemas.ConversationBase, # Esto espera el ID del otro usuario
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    # Lógica para evitar duplicados y asegurar que el otro usuario existe
    if conv_create.user2_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes crear una conversación contigo mismo.")

    other_user = db.query(models.User).filter(models.User.id == conv_create.user2_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="El otro usuario no existe.")

    # Buscar si ya existe una conversación entre estos dos usuarios
    existing_conv = db.query(models.Conversation).filter(
        ((models.Conversation.user1_id == current_user.id) & (models.Conversation.user2_id == conv_create.user2_id)) |
        ((models.Conversation.user1_id == conv_create.user2_id) & (models.Conversation.user2_id == current_user.id))
    ).first()

    if existing_conv:
        # Si ya existe, no crear una nueva, devolver la existente
        # Para que el schema.Conversation se rellene con other_user
        if existing_conv.user1_id == current_user.id:
            other_user_in_conv = db.query(models.User).filter(models.User.id == existing_conv.user2_id).first()
        else:
            other_user_in_conv = db.query(models.User).filter(models.User.id == existing_conv.user1_id).first()

        # Asumiendo que schemas.Conversation puede tomar last_message_content como Optional[str] o None
        # Y que tiene un campo 'other_user'
        return schemas.Conversation(
            id=existing_conv.id,
            user1_id=existing_conv.user1_id,
            user2_id=existing_conv.user2_id,
            last_message_timestamp=existing_conv.last_message_timestamp,
            other_user=schemas.User.from_orm(other_user_in_conv),
            last_message_content=None # O busca el último mensaje si quieres retornarlo
        )


    # Si no existe, crear la nueva conversación
    db_conv = models.Conversation(
        user1_id=current_user.id,
        user2_id=conv_create.user2_id,
        last_message_timestamp=datetime.utcnow()
    )
    db.add(db_conv)
    db.commit()
    db.refresh(db_conv)
    
    # Para la respuesta del esquema Conversation, necesitamos el 'other_user'
    # 'other_user' ya lo obtuvimos antes: 'other_user'
    return schemas.Conversation(
        id=db_conv.id,
        user1_id=db_conv.user1_id,
        user2_id=db_conv.user2_id,
        last_message_timestamp=db_conv.last_message_timestamp,
        other_user=schemas.User.from_orm(other_user), # Aquí usamos el other_user que buscamos al principio
        last_message_content=None
    )