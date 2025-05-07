from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models, schemas, security
from app.database import get_db

import logging

router = APIRouter()

logging.basicConfig(level=logging.INFO)

@router.post("/register/", response_model=schemas.Token) #Se modifica el response model.
def create_user(user: schemas.UserCreate, db: Session = Depends(security.get_db)):
    try:
        db_user_username = db.query(models.User).filter(models.User.username == user.username).first()
        db_user_email = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user_username:
            raise HTTPException(status_code=400, detail="Username already registered")
        if db_user_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = security.get_password_hash(user.password)
        db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password) # Email agregado
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        access_token = security.create_access_token(subject=db_user.username) #Se genera el token.
        return {"access_token": access_token, "token_type": "bearer"} #Se retorna el token.
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me/", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    return current_user

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