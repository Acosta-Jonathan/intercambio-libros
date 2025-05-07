import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { setTokenFromStorage } from './store/authSlice';
import './styles/global.css';

const token = localStorage.getItem('token');
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