// src/services/api.js
import axios from 'axios';
import { store } from '../store/store'; // Asegúrate de que esta ruta sea correcta y el store esté exportado

const API_URL = 'http://localhost:8000'; // Reemplaza con la URL de tu API

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
      console.log("Axios Interceptor: Requesting URL", config.url); // Agrega este log
    const token = store.getState().auth.token; // Obtiene el token del store de Redux
      console.log("Axios Interceptor: Token from Redux store:", token); // Agrega este log

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
        console.log("Axios Interceptor: Authorization header set."); // Agrega este log
    } else {
        console.log("Axios Interceptor: No token found in Redux store."); // Agrega este log
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;