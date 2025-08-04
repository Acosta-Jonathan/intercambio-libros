// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      console.log("authSlice: login action payload received:", action.payload);
      console.log("authSlice: access_token in payload:", action.payload?.access_token);
      console.log("authSlice: user in payload:", action.payload?.user);

      state.user = action.payload.user;
      state.token = action.payload.access_token;

      state.isAuthenticated = true;
      localStorage.setItem('access_token', action.payload.access_token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    },
    setTokenFromStorage: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        state.user = JSON.parse(storedUser);
      }
    },
    // ✨✨✨ AÑADIMOS LA ACCIÓN setUser AQUÍ ✨✨✨
    setUser: (state, action) => {
      // El payload de esta acción será el objeto de usuario actualizado
      state.user = action.payload;
      // También es buena idea actualizarlo en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
});

// Asegúrate de exportar la nueva acción
export const { login, logout, setTokenFromStorage, setUser } = authSlice.actions;
export default authSlice.reducer;