# app/main.py
import logging
from fastapi.staticfiles import StaticFiles
import os

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.routers import users, books, exchanges, messages, conversations
from app.database import engine, Base
import socketio
from app.socket_manager import sio

Base.metadata.create_all(bind=engine)

app = FastAPI()
socket_app = socketio.ASGIApp(sio, app)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://192.168.0.74:5173",],  # Ajusta esto a los orígenes permitidos en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear carpeta static/images si no existe
os.makedirs("static/images", exist_ok=True)

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")


app.include_router(users.router)
app.include_router(books.router)
app.include_router(exchanges.router)
app.include_router(messages.router)
app.include_router(conversations.router)

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Aplicación iniciada")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Aplicación apagada")

@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except HTTPException as http_exception:
        return JSONResponse(
            status_code=http_exception.status_code,
            content={"detail": http_exception.detail},
        )
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Error interno del servidor."},
        )

@sio.on("connect")
async def connect(sid, environ):
    print("connect ", sid)

@sio.on("disconnect")
async def disconnect(sid):
    print("disconnect ", sid)

@sio.on("message")
async def message(sid, data):
    print("message ", data)
    await sio.emit("response", data, room=sid)

