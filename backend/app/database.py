from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models.user import User
from models.base import Base
from auth_utils import hash_password  # ✅ Importar la función de hashing

# URL de conexión a la base de datos (ajústala según tu configuración)
DATABASE_URL = 'postgresql://postgres:root@localhost:5432/intercambio_libros?client_encoding=utf8'

# Configuración del motor de SQLAlchemy
engine = create_engine(DATABASE_URL)

# Crea una sesión para interactuar con la base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear las tablas en la base de datos (si no existen)
def init_db():
    Base.metadata.create_all(bind=engine)

# Dependencia para obtener la sesión en los endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Corregido: Ahora se almacena la contraseña hasheada
def create_user(db: Session, user: UsuarioCreate):
    hashed_password = hash_password(user.password)  # 🔥 Hashear la contraseña antes de guardarla
    db_user = Usuario(username=user.username, email=user.email, password=hashed_password)  # Guardar hash en la BD
    db.add(db_user)
    db.commit()
    db.refresh(db_user)  # Obtener el objeto con el ID asignado por la base de datos
    return db_user
