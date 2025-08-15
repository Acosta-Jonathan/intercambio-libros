// src/services/api.js
import axios from "axios";
import { logout } from '../store/authSlice'; // Importa la acción de logout

const API_URL = "http://localhost:8000";

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

// ✨✨✨ NUEVAS FUNCIONES PARA EL BUSCADOR Y PERFIL ✨✨✨

// 🔎 Buscar usuarios por nombre
export const searchUsers = async (searchTerm) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return Promise.reject(new Error('No hay token de autenticación para buscar usuarios.'));
  }
  const response = await api.get(`/users/search/?name=${encodeURIComponent(searchTerm)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 👨‍💼 Obtener el perfil de un usuario (usa un endpoint diferente para evitar conflictos)
export const getUserProfile = async (userId) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return Promise.reject(new Error('No hay token de autenticación para obtener el perfil.'));
  }
  const response = await api.get(`/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 📚 Obtener los libros de un usuario
export const getUserBooks = async (userId) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return Promise.reject(new Error('No hay token de autenticación para obtener los libros del usuario.'));
  }
  const response = await api.get(`/books/user-books/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateBookImage = async (bookId, imageFile, token) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch(`${API_URL}/books/${bookId}/upload-image`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al subir la imagen del libro.");
  }
  return await response.json();
};

export const updateProfilePicture = async (imageFile, token) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch(`${API_URL}/users/me/profile_picture`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al subir la foto de perfil.");
  }
  return await response.json();
};

// 📡 Conectar WebSocket
export const connectWebSocket = (onMessage) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    console.error("No hay token para WebSocket");
    return null;
  }

  const ws = new WebSocket(`ws://localhost:8000/messages/ws?token=${token}`);

  ws.onopen = () => {
    console.log("Conectado al WebSocket");
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (onMessage) {
      onMessage(message);
    }
  };

  ws.onclose = () => {
    console.log("Desconectado del WebSocket");
  };

  ws.onerror = (err) => {
    console.error("Error en WebSocket", err);
  };

  return ws;
};

// 📤 Enviar mensaje por WebSocket
export const sendWebSocketMessage = (ws, receiverId, content) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ receiver_id: receiverId, content }));
  } else {
    console.error("WebSocket no está conectado");
  }
};

// 📩 Obtener conversaciones del usuario
export const getConversations = async () => {
  const token = localStorage.getItem("access_token");
  const response = await api.get("/conversations/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getMessages = async (userId, token) => {
  const response = await api.get(`/messages/conversation/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const startConversation = async (receiverId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/conversations/`,
      { receiver_id: receiverId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al iniciar la conversación:", error);
    throw error;
  }
};
export default api;