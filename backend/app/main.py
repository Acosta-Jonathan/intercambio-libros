from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine, database
from models.libro import Libro, LibroCreate, LibroResponse
from contextlib import asynccontextmanager

app = FastAPI()

# Ruta de prueba
@app.get("/")
async def root():
    return {"message": "API funcionando correctamente"}

# Crear una nueva sesión para cada solicitud
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Crear un nuevo libro
@app.post("/libros/", response_model=LibroResponse)
async def crear_libro(libro: LibroCreate, db: Session = Depends(get_db)):
    db_libro = Libro(**libro.dict())  # Usando el modelo SQLAlchemy para guardar en la base de datos
    db.add(db_libro)
    db.commit()
    db.refresh(db_libro)
    return db_libro  # Esto será convertido en el modelo Pydantic 'Libro' automáticamente

# Obtener todos los libros
@app.get("/libros/")
async def obtener_libros(db: Session = Depends(get_db)):
    try:
        libros = db.query(Libro).all()
        if not libros:
            return {"message": "No hay libros disponibles"}
        return libros
    except Exception as e:
        print("⚠️ Error al obtener libros:", e)
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# Obtener un libro por su ID
@app.get("/libros/{libro_id}")
async def obtener_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if libro is None:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return libro

# Función de inicio para agregar libros de prueba
@app.on_event("startup")
async def agregar_libros_de_prueba():
    db = SessionLocal()
    if db.query(Libro.id).count() == 0:  # Si no hay libros en la base de datos
        libros_de_prueba = [
            Libro(titulo="El Gran Gatsby", autor="F. Scott Fitzgerald", descripcion="Una novela sobre la decadencia del sueño americano."),
            Libro(titulo="1984", autor="George Orwell", descripcion="Una novela distópica sobre un gobierno totalitario."),
            Libro(titulo="To Kill a Mockingbird", autor="Harper Lee", descripcion="Un clásico sobre la injusticia racial en el sur de EE.UU."),
            Libro(titulo="Matar a un ruiseñor", autor="Harper Lee", descripcion="Narrativa sobre la vida en un pueblo sureño y la lucha contra el racismo."),
            Libro(titulo="Cien años de soledad", autor="Gabriel García Márquez", descripcion="La obra maestra de García Márquez sobre el realismo mágico.")
        ]
        db.add_all(libros_de_prueba)
        db.commit()
        print("Libros agregados de prueba:")
        for libro in libros_de_prueba:
            print(f"- {libro.titulo}")
    else:
        print("Ya existen libros en la base de datos.")
    db.close()

# Función de apagado para cerrar la conexión a la base de datos
@app.on_event("shutdown")
async def shutdown():
    print("Apagando la aplicación...")
    await database.disconnect()
