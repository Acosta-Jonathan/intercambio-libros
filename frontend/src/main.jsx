// src/main.jsx (o src/index.js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { setTokenFromStorage } from './store/authSlice';
import './styles/global.css';

const token = localStorage.getItem('access_token');
const storedUser = localStorage.getItem('user');

if (token && token !== 'undefined') {
  store.dispatch(setTokenFromStorage(token));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);