// src/components/pages/LoginPage.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { loginUser } from '../services/auth';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage('');

  try {
    const data = await loginUser(usernameOrEmail, password);

    console.log("Respuesta de backend:", data);
    dispatch(login({ access_token: data.access_token, user: data.user }));
    navigate('/');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    if (error.response?.status === 401) {
      setErrorMessage('Nombre de usuario o contraseña incorrectos.');
    } else {
      setErrorMessage('Error al conectar con el servidor.');
    }
  }
};

  return (
    <div className="auth-page-wrapper">
      <div className="container">
        <h1>Iniciar Sesión</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre de usuario o Email"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Iniciar Sesión</button>
        </form>
        <p>
          ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;