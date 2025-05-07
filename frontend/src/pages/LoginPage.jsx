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
    try {
      const formData = new URLSearchParams(); // Creamos un objeto URLSearchParams
      formData.append('username', usernameOrEmail); // Agregamos username
      formData.append('password', password); // Agregamos password

      const user = await loginUser(formData); // Enviamos formData
      dispatch(login(user));
      navigate('/'); // Redirigimos al usuario a la página principal
    } catch (error) {
      console.error('Error al iniciar sesión', error);
      if (error.response && error.response.status === 401) {
        if (error.response.data.detail === 'Incorrect username or password') {
          // Asumimos que el backend devuelve un mensaje de error detallado
          if (error.response.data.detail.includes('username')) {
            setUsernameOrEmail('');
            setErrorMessage('Nombre de usuario o email incorrecto.');
          } else if (error.response.data.detail.includes('password')) {
            setPassword('');
            setErrorMessage('Contraseña incorrecta.');
          } else {
            setErrorMessage('Nombre de usuario o contraseña incorrectos.');
          }
        } else {
          setErrorMessage('Nombre de usuario o contraseña incorrectos.');
        }
      } else {
        setErrorMessage('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="container">
      <h1>Iniciar Sesión</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Mostramos el mensaje de error */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de usuario o Email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
        />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Iniciar Sesión</button>
      </form>
      <p>
        ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default LoginPage;