import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  token: null, // Agregamos el token JWT al estado
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token; // Almacenamos el token
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token); // Almacenamos el token en localStorage
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token'); // Eliminamos el token de localStorage
    },
    setTokenFromStorage: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
  },
});

export const { login, logout, setTokenFromStorage } = authSlice.actions;
export default authSlice.reducer;