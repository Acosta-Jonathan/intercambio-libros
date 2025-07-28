// src/services/auth.js
import api from './api';

export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await api.post('/login/', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};

export const registerUser = async (userData) => {
  try {
    // Si tu backend para /register/ espera JSON, esto está bien
    const response = await api.post('/register/', userData);
    return response.data;
  } catch (error) {
    console.error('Error in registerUser:', error);
    throw error;
  }
};