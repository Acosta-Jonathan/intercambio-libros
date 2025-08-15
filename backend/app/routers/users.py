# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.models import User
from app.schemas.user import UserContactSchema
from app import models, schemas, security
from app.database import get_db
from app.schemas.user import UpdateTelefono
from fastapi.responses import JSONResponse

import logging
from typing import List
import random
import shutil
import os

UPLOAD_FOLDER = "static/profile_pictures"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
router = APIRouter()

logging.basicConfig(level=logging.INFO)

# --- Función auxiliar para generar sugerencias de nombres de usuario ---
def generate_username_suggestions(db: Session, base_username: str) -> List[str]:
    """Genera una lista de nombres de usuario sugeridos que no están en uso."""
    suggestions = []
    # Intentar con sufijos numéricos
    for i in range(1, 6): # Intentar con 1, 2, 3, 4, 5
        suggestion = f"{base_username}{i}"
        if not db.query(models.User).filter(models.User.username == suggestion).first():
            suggestions.append(suggestion)
            if len(suggestions) >= 3: # Limitar a 3 sugerencias
                return suggestions

    # Intentar con combinaciones de punto y número
    if len(suggestions) < 3:
        for i in range(1, 4):
            suggestion = f"{base_username}.{i}"
            if not db.query(models.User).filter(models.User.username == suggestion).first():
                suggestions.append(suggestion)
                if len(suggestions) >= 3:
                    return suggestions

    # Intentar con sufijos aleatorios si aún faltan sugerencias
    while len(suggestions) < 3:
        random_suffix = ''.join(random.choices('0123456789', k=random.randint(2, 4))) # 2 a 4 dígitos
        suggestion = f"{base_username}_{random_suffix}"
        if not db.query(models.User).filter(models.User.username == suggestion).first():
            suggestions.append(suggestion)
            if len(suggestions) >= 3:
                return suggestions
    
    return suggestions[:3] # Asegurarse de devolver un máximo de 3

# --- Endpoint de registro ---
@router.post("/register/", response_model=schemas.Token)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)): # Usar get_db directamente
    try:
        db_user_username = db.query(models.User).filter(models.User.username == user.username).first()
        db_user_email = db.query(models.User).filter(models.User.email == user.email).first()
        
        if db_user_username:
            # ✨✨✨ Modificación para devolver sugerencias ✨✨✨
            suggestions = generate_username_suggestions(db, user.username)
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"El nombre de usuario '{user.username}' ya está en uso.",
                    "suggestions": suggestions
                }
            )
        if db_user_email:
            raise HTTPException(status_code=400, detail="El email ya está registrado.")
        
        hashed_password = security.get_password_hash(user.password)
        db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        access_token = security.create_access_token(subject=db_user.username)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": schemas.User.from_orm(db_user)
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Error interno al registrar usuario: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno del servidor al registrar usuario.")

# --- Resto de tus endpoints (sin cambios) ---
@router.post("/login/", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter((models.User.username == form_data.username) | (models.User.email == form_data.username)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or email",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(subject=user.username)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.User.from_orm(user)
    }

@router.get("/me/", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    return current_user

@router.put("/update-telefono/", response_model=schemas.User)
def update_telefono(
    telefono_data: UpdateTelefono,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.telefono = telefono_data.telefono
    db.commit()
    db.refresh(user)
    
    return user

@router.get("/users/{user_id}", response_model=UserContactSchema)
def get_user_contact(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


# 🎉 NUEVO ENDPOINT PARA OBTENER EL PERFIL COMPLETO DE UN USUARIO 🎉
@router.get("/users/{user_id}/profile", response_model=schemas.User)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

# 🔎 NUEVO ENDPOINT PARA BUSCAR USUARIOS POR NOMBRE 🎉
@router.get("/users/search/", response_model=List[schemas.User])
def search_users(
    search_term: str = Query(..., alias="name"),
    db: Session = Depends(get_db)
):
    """
    Busca usuarios por su nombre de usuario (username).
    """
    if not search_term:
        return []

    users = db.query(models.User).filter(
        models.User.username.ilike(f"%{search_term}%")
    ).limit(10).all()
    
    return users


# ✅ **Endpoint para subir o actualizar la foto de perfil**
@router.put("/users/me/profile_picture", response_model=schemas.User)
def update_profile_picture(
    file: UploadFile = File(...),
    current_user: models.User = Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Sube o actualiza la foto de perfil del usuario logueado.
    """
    try:
        # ✨ CAMBIO CLAVE: Obtener el objeto User de la sesión actual antes de modificarlo
        user_to_update = db.query(models.User).filter(models.User.id == current_user.id).first()
        
        if not user_to_update:
            raise HTTPException(status_code=404, detail="Usuario no encontrado en la base de datos.")

        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen.")

        file_extension = file.filename.split('.')[-1]
        file_name = f"user_{user_to_update.id}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, file_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        profile_picture_url = f"/static/profile_pictures/{file_name}"

        # Ahora actualizamos la instancia correcta, que está en la sesión actual
        user_to_update.profile_picture_url = profile_picture_url
        db.commit()
        db.refresh(user_to_update)

        return user_to_update
    except Exception as e:
        logging.error(f"Error al subir la foto de perfil: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno del servidor al subir la foto.")


# # ✅ **Cambio de contraseña**
# @router.post("/change-password/")
# def change_password(
#     password_data: schemas.ChangePassword,
#     current_user: models.User = Depends(security.get_current_user),
#     db: Session = Depends(get_db),
# ):
#     if not security.verify_password(password_data.old_password, current_user.hashed_password):
#         raise HTTPException(status_code=400, detail="Incorrect old password")
    
#     new_hashed_password = security.get_password_hash(password_data.new_password)
#     current_user.hashed_password = new_hashed_password
#     db.commit()
#     return {"message": "Password updated successfully"}

# # ✅ **Verificación de email**
# @router.get("/verify-email/")
# def verify_email(token: str, db: Session = Depends(get_db)):
#     logging.info(f"Verifying email with token: {token}")
#     email = security.verify_email_token(token)
#     if not email:
#         raise HTTPException(status_code=400, detail="Invalid verification token")

#     logging.info(f"Email from token: {email}")
#     user = db.query(models.User).filter(models.User.email == email).first()
#     if not user:
#         logging.error(f"User not found for email: {email}")
#         raise HTTPException(status_code=404, detail="User not found")

#     user.is_verified = True
#     db.commit()
#     logging.info(f"Email verified for user: {user.id}")
#     return {"message": "Email verified successfully"}

# # ✅ **Renovación de token (Refresh Token)**
# @router.post("/refresh/")
# def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
#     username = security.verify_access_token(refresh_token)
#     if not username:
#         raise HTTPException(status_code=401, detail="Invalid refresh token")

#     new_access_token = security.create_access_token(subject=username)
#     return {"access_token": new_access_token, "token_type": "bearer"}