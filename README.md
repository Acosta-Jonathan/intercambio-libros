# intercambio-libros

# PRECONFIGURACION
# crear un archivo ".env" en el directorio raíz completando los siguientes datos:
    SECRET_KEY=[Su-Clave]
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=[numero entero que desee ej: 30]
    DATABASE_URL = 'postgresql://[SU-USUARIO]:[SU-CONTRASEÑA]@localhost:[PUERTO-DE-SU-DDBB]/[NOMBRE-DE-BBDD]?client_encoding=utf8'

# BACKEND
  # para crear el entorno virtual
    cd ./backend
    python -m venv venv

  # para ejecutar venv
    venv\Scripts\activate

  # Para instalar todas las dependencias del requirements.txt
    pip install -r requirements.txt

  # Para generar/actualizar el requirements.txt
    pip freeze > requirements.txt

  # Para ejecutar el backend:
    cd ./backend
    uvicorn app.main:app --reload

# FRONTEND
  # para instalar dependencias de Frontend:
    npm install
  
  # Para ejecutar frontend
  cd ./frontend
  # opc 1: 
    npm start
  # opc 2: 
    npm run dev
