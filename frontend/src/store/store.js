import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
// Importa otros reducers aquí

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Agrega otros reducers aquí
  },
});