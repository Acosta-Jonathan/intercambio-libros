import { api } from './api';

export const loginUser = async (formData) => { // Recibimos formData
  const response = await api.post('/login/', formData, { // Enviamos formData
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // Indicamos el tipo de contenido
    },
  });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/register/', userData);
  return response.data;
};