# app/socket_manager.py
import socketio

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")

# Mapea socket_id a user_id
sio.sid_user_map = {}
# Mapea user_id a socket_id (si un usuario tiene múltiples conexiones, puede ser una lista de sids)
sio.user_sid_map = {}