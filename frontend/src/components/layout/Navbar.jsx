// src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice'; // Asegúrate de que la ruta a authSlice sea correcta
import '../../styles/Navbar.css'; // Asegúrate de que la ruta a Navbar.css sea correcta

const Navbar = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user); // Para mostrar el nombre del usuario si lo deseas
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Despacha la acción de logout de Redux
    navigate('/login'); // Redirige al usuario a la página de login
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Intercambio de Libros</Link>
      </div>
      <ul className="navbar-links">
        {isAuthenticated ? (
          <>
            {/* Si está autenticado */}
            <li>
              <Link to="/">Libros</Link>
            </li>
            <li>
              <Link to="/profile">Mi Perfil</Link> {/* Asumiendo que tendrás una página de perfil */}
            </li>
            <li>
              <Link to="/messages">Mensajes</Link> {/* Asumiendo que tendrás una página de mensajes */}
            </li>
            {user && <li className="navbar-username">Hola, {user.username || user.email}!</li>} {/* Mostrar nombre/email del usuario */}
            <li>
              <button onClick={handleLogout} className="navbar-button">Cerrar Sesión</button>
            </li>
          </>
        ) : (
          <>
            {/* Si NO está autenticado */}
            <li>
              <Link to="/login">Iniciar Sesión</Link>
            </li>
            <li>
              <Link to="/register">Registrarse</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;