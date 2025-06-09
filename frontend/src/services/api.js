// src/services/api.js
import axios from 'axios';
import { store } from '../store/store';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    console.log("Axios Interceptor: Requesting URL", config.url);
    const rawToken = store.getState().auth.token; // Obtiene el token como está
    const token = typeof rawToken === 'string' && rawToken.length > 0 ? rawToken : null; // Asegura que sea un string no vacío

    console.log("Axios Interceptor: Token from Redux store (processed):", token); // Log del token procesado

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Axios Interceptor: Authorization header set.");
    } else {
      console.log("Axios Interceptor: No valid token found in Redux store.");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;