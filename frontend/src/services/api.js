import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
});

// 🔍 Obtener todos los libros
export const getAllBooks = async () => {
  const response = await api.get("/books/");
  return response.data;
};

// 🔍 Obtener un libro por ID
export const getBookById = async (id) => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

export const getMyBooks = async (token) => {
  const response = await api.get('/books/my-books', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteBook = async (bookId, token) => {
  await api.delete(`/books/${bookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateBook = async (bookId, updatedData, token) => {
  const response = await api.put(`/books/${bookId}`, updatedData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 📝 Agregar un libro
export const createBook = async (data, token) => {
  const response = await api.post("/books/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 📸 Subir imagen del libro
export const uploadBookImage = async (bookId, imageFile, token) => {
  const formData = new FormData();
  formData.append("file", imageFile); // <-- importante: "file"

  const response = await api.post(`/books/${bookId}/image/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// 💬 Iniciar conversación con otro usuario
export const iniciarConversacion = async (receiverId) => {
  const token = localStorage.getItem("token");
  const response = await api.post(
    "/conversations/",
    { receiver_id: receiverId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export default api;
