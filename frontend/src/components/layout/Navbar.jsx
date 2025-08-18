import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import "../../styles/Navbar.css";
import { useEffect, useState } from "react";
import { BsChatDotsFill } from "react-icons/bs";

const Navbar = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // ✨ Usa el hook useLocation

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // ✨ Aplica la clase scrolled si la ruta es /mensajeria, o si el usuario ha scrolleado
            const isScrolled = location.pathname.startsWith('/mensajeria') || window.scrollY > 0;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        handleScroll(); // ✨ Llama a la función al cargar el componente para establecer el estado inicial
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [scrolled, location.pathname]); // ✨ Añade location.pathname a las dependencias

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
            <div className="navbar__logo img">
                <Link to="/">
                    <img src="/Intercambio-libros.png" alt="Intercambio de Libros" />
                </Link>
            </div>

            <ul className="navbar__links">
                <li><NavLink to="/">Inicio</NavLink></li>
                {isAuthenticated && (
                    <>
                        <li><NavLink to="/mis-libros">Mi Perfil</NavLink></li>
                        <li><NavLink to="/crear-libro">Publicar Libro</NavLink></li>
                    </>
                )}
            </ul>

            <div className="navbar__actions">
                {isAuthenticated ? (
                    <>
                        <NavLink to="/mensajeria" className="btn-mensajes">
                            <BsChatDotsFill size={24} />
                        </NavLink>
                        <button onClick={handleLogout} className="btn-secondary me-5">
                            Cerrar sesión
                        </button>
                    </>
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