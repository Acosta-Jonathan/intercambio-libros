# app/security.py

from datetime import datetime, timedelta, timezone # Importa timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt # Importa JWTError
from passlib.context import CryptContext
from pydantic import ValidationError # Sigue siendo útil para TokenPayload

from sqlalchemy.orm import Session
from app.database import SessionLocal # Asumo que get_db usa esto
from app.models import User # Necesario para get_current_user
from app.schemas import TokenPayload # Necesario para get_current_user

from dotenv import load_dotenv, find_dotenv # Importa find_dotenv
import os

# Cargar variables de entorno desde .env de forma más robusta
dotenv_path = find_dotenv()
if dotenv_path:
    load_dotenv(dotenv_path)
else:
    load_dotenv() # Fallback si find_dotenv no encuentra el archivo

# Configuración de JWT
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256") # Valor por defecto si no está en .env
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)) # Valor por defecto si no está en .env

# Asegúrate de que las variables críticas estén definidas
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set. Please set it in your .env file.")
if not ALGORITHM:
    raise ValueError("ALGORITHM environment variable is not set. Please set it in your .env file or ensure it defaults correctly.")


# Configuración de hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token") # Ajustado a "users/token" si ese es tu endpoint de login


# Función para obtener la sesión de la base de datos (mantenida aquí según tu código)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Funciones de seguridad
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña plana coincide con el hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Genera un hash para la contraseña."""
    return pwd_context.hash(password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un token de acceso JWT."""
    to_encode = {"sub": str(subject)} # "sub" (subject) es el usuario o ID
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str) -> Optional[str]:
    """Verifica un token de acceso JWT y retorna el nombre de usuario."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError: # Captura errores relacionados con el JWT (firma, expiración, etc.)
        raise credentials_exception
    except Exception: # Captura cualquier otra excepción inesperada
        raise credentials_exception

def verify_email_token(token: str) -> Optional[str]:
    """Verifica un token de correo electrónico y retorna el email."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email") # Obtiene el email del payload del token
        if email is None:
            raise credentials_exception
        return email
    except JWTError: # Captura errores relacionados con el JWT (firma, expiración, etc.)
        raise credentials_exception
    except Exception: # Captura cualquier otra excepción inesperada
        raise credentials_exception

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Obtiene el usuario actual a partir del token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Aquí ValidationError es relevante porque TokenPayload es un modelo Pydantic
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenPayload(sub=username)
    except (JWTError, ValidationError): # Captura ambos tipos de errores
        raise credentials_exception
    except Exception: # Captura cualquier otra excepción inesperada
        raise credentials_exception

    user = db.query(User).filter(User.username == token_data.sub).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user