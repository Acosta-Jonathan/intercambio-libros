from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from routers import auth
from database import init_db, create_user

app = FastAPI()

# Crear las tablas en la base de datos al iniciar
init_db()

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la tienda de ropa musical"}

app.include_router(auth.router) 