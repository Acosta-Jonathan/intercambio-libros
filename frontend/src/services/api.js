import axios from "axios";
import { logout } from '../store/authSlice'; // Importa la acción de logout

const API_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variables para almacenar el dispatch y navigate
// Se inicializarán desde el componente raíz (App.js)
let storeDispatch = null;
let storeNavigate = null;

// Función para inicializar el dispatch y navigate
export const initApiServices = (dispatch, navigate) => {
  storeDispatch = dispatch;
  storeNavigate = navigate;
};

// Interceptor de respuesta de Axios
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, la pasa sin cambios
  async (error) => {
    // Si hay un error en la respuesta del servidor y el estado es 401
    if (error.response && error.response.status === 401) {
      console.log('Token expirado o no autorizado. Redirigiendo al login...');
      // Asegúrate de que dispatch y navigate estén disponibles
      if (storeDispatch && storeNavigate) {
        storeDispatch(logout()); // Despacha la acción de logout
        storeNavigate('/login'); // Redirige a la página de login
      } else {
        // Fallback si por alguna razón dispatch o navigate no están inicializados
        console.error('Dispatch o Navigate no inicializados en api.js. Recargando para login.');
        window.location.href = '/login'; // Recarga la página y el App.js debería manejar la redirección
      }
    }
    return Promise.reject(error); // Reenvía el error para que el componente que hizo la llamada lo maneje si es necesario
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
  // Asegúrate de obtener el token de Redux o pasarlo como argumento si es necesario
  // Para este caso, si el token ya está en el interceptor, no necesitas pasarlo aquí
  const token = localStorage.getItem("access_token"); // O del store de Redux
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

// ✨✨✨ CAMBIO AQUÍ: Usar `api.put` en lugar de `fetch` ✨✨✨
export const actualizarTelefono = async (telefono, token) => {
  const response = await api.put("/update-telefono/", { telefono }, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // Axios ya devuelve response.data como el JSON parseado
};

export const getUserContact = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data; // { email, telefono }
};

export default api;