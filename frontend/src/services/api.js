import axios from "axios";
import { logout } from '../store/authSlice'; // Importa la acción de logout

const API_URL = "http://192.168.0.74:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let storeDispatch = null;
let storeNavigate = null;

export const initApiServices = (dispatch, navigate) => {
  storeDispatch = dispatch;
  storeNavigate = navigate;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Token expirado o no autorizado. Redirigiendo al login...');
      if (storeDispatch && storeNavigate) {
        storeDispatch(logout());
        storeNavigate('/login');
      } else {
        console.error('Dispatch o Navigate no inicializados en api.js.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
  formData.append("file", imageFile);

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
  const token = localStorage.getItem("access_token");
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

export const actualizarTelefono = async (telefono, token) => {
  const response = await api.put("/update-telefono/", { telefono }, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ✨✨✨ CAMBIO AQUÍ: Asegúrate de que getUserContact envíe el token ✨✨✨
export const getUserContact = async (userId) => {
  const token = localStorage.getItem('access_token'); // Obtén el token
  if (!token) {
    // Si no hay token, no podemos hacer la llamada autenticada
    // El interceptor no se activará aquí, así que manejamos el error directamente
    return Promise.reject(new Error('No hay token de autenticación para obtener el contacto del usuario.'));
  }

  const response = await api.get(`/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`, // Añade el encabezado de autorización
    },
  });
  return response.data;
};

export default api;