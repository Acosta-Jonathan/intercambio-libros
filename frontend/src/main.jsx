// src/main.jsx (o src/index.js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { setTokenFromStorage } from './store/authSlice';
import './styles/global.css';

// *** CAMBIO AQUI: Usar 'access_token' si esa es la clave que ahora guardas ***
const token = localStorage.getItem('access_token');
const storedUser = localStorage.getItem('user'); // Este está bien

if (token) {
  store.dispatch(setTokenFromStorage(token));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);