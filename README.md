
# Intercambio Libros

Intercambio Libros is a web application for exchanging books between users. It features a FastAPI backend and a React frontend, allowing users to register, list books, upload images, chat, and manage their profiles.

## Table of Contents
- [Features](#features)
- [Setup](#setup)
- [API Usage Examples](#api-usage-examples)
- [Frontend Usage Examples](#frontend-usage-examples)
- [Project Structure](#project-structure)

## Features
- User registration and authentication
- Book listing, creation, editing, and deletion
- Book image upload
- Search and filter books
- Real-time messaging between users
- User profile management

## Setup

### 1. Environment Variables
Create a `.env` file in the root directory with the following content:
```
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://<USER>:<PASSWORD>@localhost:<PORT>/<DBNAME>?client_encoding=utf8
```

### 2. Backend Setup
```sh
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```sh
cd frontend
npm install
npm run dev
```

## API Usage Examples

### Create a Book
```http
POST /books/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "categories": ["Fiction", "Adventure"],
  ...other fields...
}
```

### Upload Book Image
```http
POST /books/{book_id}/image/
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image file>
```

### List Books (with filters)
```http
GET /books/?title=Harry&author=Rowling&category=Fantasy
```

## Frontend Usage Examples

- Run the frontend with `npm run dev` and access `http://localhost:5173`.
- Register a new user, log in, and start listing or searching for books.
- Use the "Add Book" page to create a new book and upload an image.
- Use the messaging feature to chat with other users about book exchanges.

## Project Structure

- `backend/`: FastAPI backend, database models, routers, and schemas
- `frontend/`: React frontend, components, pages, services

---
For more details, see the code documentation and comments in each module.
