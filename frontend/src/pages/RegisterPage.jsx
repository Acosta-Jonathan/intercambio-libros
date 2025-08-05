import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom'; // <-- Link agregado
import { login } from '../store/authSlice';
import { registerUser } from '../services/auth';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

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
        const detail = error.response.data?.detail;
        if (typeof detail === 'string') {
          setErrorMessage(detail);
        } else {
          setErrorMessage('Error en el registro. Verifica los datos.');
        }
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

        {/* Agregado: redirección a login */}
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
