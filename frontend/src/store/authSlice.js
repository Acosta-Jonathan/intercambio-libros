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
      // action.payload es el objeto completo de respuesta del backend:
      // { access_token: "...", token_type: "bearer", user: {...} }

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