from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db, create_user
from schemas.user import UsuarioCreate, UsuarioOut
from models.user import User
from auth_utils import hash_password, create_access_token, verify_password
from datetime import timedelta
from jose import JWTError, jwt

# Configuración del JWT
SECRET_KEY = "secret-key-super-segura"  # ¡Cámbiala por una clave segura!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Obtiene el usuario autenticado a partir del token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")

    return usuario

@router.post("/registro")
def registrar_usuario(user: UsuarioCreate, db: Session = Depends(get_db)):
    # Verificar si el nombre de usuario ya existe
    db_user = db.query(Usuario).filter(Usuario.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Encriptar la contraseña antes de guardarla
    hashed_password = hash_password(user.password)
    user.password = hashed_password  # Reemplaza la contraseña en texto plano por la cifrada

    # Verificar si es el primer usuario, asignar rol admin si es el primero
    user_count = db.query(Usuario).count()
    if user_count == 0:
        role = "admin"
    else:
        role = "cliente"

    # Crear y agregar el nuevo usuario a la base de datos con el rol asignado
    new_user = Usuario(username=user.username, email=user.email, password=hash_password(user.password), role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"id": new_user.id, "nombre": new_user.username, "email": new_user.email, "role": new_user.role}


@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario or not verify_password(password, usuario.password):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")

    access_token = create_access_token(data={"sub": usuario.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UsuarioOut)
def obtener_usuario_actual(usuario: Usuario = Depends(get_current_user)):
    """Devuelve los datos del usuario autenticado"""
    return usuario

