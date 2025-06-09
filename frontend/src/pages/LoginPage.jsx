// src/components/pages/LoginPage.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice'; // La ruta corregida es ../../store/authSlice
import { loginUser } from '../services/auth'; // La ruta corregida es ../../services/auth
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Limpiar cualquier mensaje de error previo

    try {
      // *** CAMBIO: Pasa username y password directamente a loginUser ***
      const data = await loginUser(usernameOrEmail, password);

      // Asumiendo que `data` contiene { access_token: "...", user: { ... } }
      // Asegúrate de que `login` en authSlice espera el token y el objeto user.
      dispatch(login({ token: data.access_token, user: data.user })); // Envía el token y el user object
      navigate('/'); // Redirigimos al usuario a la página principal
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // Mejorar el manejo de errores:
      if (error.response) {
        // El servidor respondió con un estado fuera del rango 2xx
        if (error.response.status === 401) {
          setErrorMessage('Nombre de usuario o contraseña incorrectos.');
        } else if (error.response.status === 400) {
          setErrorMessage(error.response.data.detail || 'Solicitud incorrecta.');
        } else {
          setErrorMessage(`Error del servidor: ${error.response.status}. Inténtalo de nuevo.`);
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        setErrorMessage('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        // Algo más causó el error
        setErrorMessage('Error inesperado. Inténtalo de nuevo.');
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