# intercambio-libros

# para crear el entorno virtual
python -m venv venv

# para ejecutar venv
venv\Scripts\activate

# Para generar/actualizar el requirements.txt
pip freeze > requirements.txt

# Para ejecutar el backend
cd ./backend
uvicorn main:app --reload
# Para finalizarlo
Ctrl + C

# para instalar dependencias de Frontend
npm install
# Para ejecutar frontend
cd ./frontend
npm start
