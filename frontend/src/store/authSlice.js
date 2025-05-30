// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
// import api from '../services/api'; // No es necesario importar api aquí si no lo usas directamente en un thunk

const initialState = {
  user: null, // <-- Solucionado: solo una vez
  isAuthenticated: false,
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      // action.payload viene del backend y debería tener { access_token: "...", token_type: "bearer", user: {...} }
      state.user = action.payload.user;
      state.token = action.payload.access_token; // <-- ¡CAMBIO CLAVE AQUÍ! Usar access_token
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.access_token); // <-- ¡CAMBIO CLAVE AQUÍ!
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setTokenFromStorage: (state, action) => {
      // action.payload aquí es el token string
      state.token = action.payload;
      state.isAuthenticated = true;
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        state.user = JSON.parse(storedUser);
      }
    },
  },
});

export const { login, logout, setTokenFromStorage } = authSlice.actions;
export default authSlice.reducer;