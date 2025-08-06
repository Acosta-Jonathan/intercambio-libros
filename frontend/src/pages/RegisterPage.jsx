import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../store/authSlice';
import { registerUser } from '../services/auth';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setUsernameSuggestions([]);

    try {
      const user = await registerUser({ email, password, username });

      if (user?.access_token && user?.user) {
        dispatch(login({ access_token: user.access_token, user: user.user }));
        navigate('/');
      } else {
        setErrorMessage('Error inesperado al registrar. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al registrar usuario', error);
      if (error.response) {
        const responseData = error.response.data; // Obtén todo el objeto de datos de la respuesta
        let detailMessage = 'Error en el registro. Verifica los datos.'; // Mensaje por defecto
        let suggestions = [];

        // ✨✨✨ Lógica de manejo de errores mejorada ✨✨✨
        if (responseData && typeof responseData.detail === 'object' && responseData.detail !== null) {
          // Si 'detail' es un objeto (como lo envía tu backend ahora)
          detailMessage = responseData.detail.message || detailMessage;
          suggestions = responseData.detail.suggestions || [];
        } else if (typeof responseData.detail === 'string') {
          // Si 'detail' es una cadena (para otros errores que no sean de username)
          detailMessage = responseData.detail;
        }

        setErrorMessage(detailMessage);
        setUsernameSuggestions(suggestions);

      } else {
        setErrorMessage('Error de conexión con el servidor.');
      }
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container">
        <h1>Registrarse</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {usernameSuggestions.length > 0 && (
          <div className="username-suggestions">
            <p>Sugerencias de nombres de usuario:</p>
            <ul>
              {usernameSuggestions.map((suggestion, index) => (
                <li key={index} onClick={() => setUsername(suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
            <small>Haz clic en una sugerencia para usarla.</small>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            La contraseña debe tener al menos 8 caracteres.
          </small>
          <br />
          <button className='btn btn-outline-primary' type="submit">Registrarse</button>
        </form>

        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;