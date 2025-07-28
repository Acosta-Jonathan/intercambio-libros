import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import "../../styles/Navbar.css";

const Navbar = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo img">
  <Link to="/">
    <img src="/Intercambio-libros.png" alt="Intercambio de Libros"/>
  </Link>
</div>

      <ul className="navbar__links">
        <li><NavLink to="/">Inicio</NavLink></li>
        {isAuthenticated && (
          <>
            <li><NavLink to="/mis-libros">Mis Libros</NavLink></li>
            <li><NavLink to="/crear-libro">Publicar Libro</NavLink></li>
            <li><NavLink to="/mensajes">Mensajes</NavLink></li>
          </>
        )}
      </ul>

      <div className="navbar__actions">
  {isAuthenticated ? (
    <button onClick={handleLogout} className="btn-secondary">
      Cerrar sesión
    </button>
  ) : (
    <>
      <Link to="/login" className="btn-outline">Iniciar sesión</Link>
      <Link to="/register" className="btn-primary">Registrarse</Link>
    </>
  )}
</div>
    </nav>
  );
};

export default Navbar;
