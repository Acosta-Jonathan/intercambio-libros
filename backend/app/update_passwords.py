from database import SessionLocal
from models.user import User
from auth_utils import hash_password

db = SessionLocal()

usuarios = db.query(Usuario).all()
for usuario in usuarios:
    if usuario.password == "string":  # Solo actualiza contraseñas incorrectas
        usuario.password = hash_password("123456")  # Cambia todas a "123456" (puedes modificarlo)

db.commit()
db.close()

print("Contraseñas actualizadas correctamente.")
