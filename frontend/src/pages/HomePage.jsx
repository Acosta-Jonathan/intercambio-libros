import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Importamos las funciones necesarias, incluyendo la nueva para buscar usuarios
import { getAllBooks, searchUsers } from "../services/api";
import "../styles/HomePage.css";
import {
  TODAS_LAS_CATEGORIAS,
  TODOS_LOS_ESTADOS,
  TODOS_LOS_IDIOMAS,
} from "../data/constants";
import { useSelector } from "react-redux";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";

const HomePage = () => {
  // Estados para los libros y filtros
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [idioma, setIdioma] = useState("");
  const [estado, setEstado] = useState("");
  const [editorial, setEditorial] = useState("");
  const [edicion, setEdicion] = useState("");

  // Estados para el modal de detalles
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // NUEVOS ESTADOS para la búsqueda de usuarios
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [loadingUserSearch, setLoadingUserSearch] = useState(false);
  const [showUserResultsDropdown, setShowUserResultsDropdown] = useState(false);

  // NUEVO ESTADO para el checkbox de "ocultar mis libros"
  const [ocultarMisLibros, setOcultarMisLibros] = useState(false);

  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.auth.user);
  const loggedInUserId = loggedInUser?.id || null;

  // Efecto para cargar todos los libros al inicio
  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const data = await getAllBooks();
        setLibros(data);
      } catch (error) {
        console.error("Error al cargar libros:", error);
      }
    };
    fetchLibros();
  }, []);

  // Efecto para controlar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showDetailsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDetailsModal]);

  // NUEVO EFECTO para la búsqueda de usuarios con "debounce"
  // Esto retrasa la llamada a la API para evitar un exceso de peticiones mientras el usuario escribe.
  useEffect(() => {
    if (busqueda.trim() === "") {
      setShowUserResultsDropdown(false);
      setUserSearchResults([]);
      return;
    }

    // Se muestra el dropdown y el estado de carga
    setShowUserResultsDropdown(true);
    setLoadingUserSearch(true);

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchUsers(busqueda);
        setUserSearchResults(results);
      } catch (error) {
        console.error("Error buscando usuarios:", error);
        setUserSearchResults([]);
      } finally {
        setLoadingUserSearch(false);
      }
    }, 500); // 500ms de retraso

    // Función de limpieza para cancelar el timeout si el componente se desmonta o 'busqueda' cambia
    return () => clearTimeout(timeoutId);
  }, [busqueda]);

  // Función para filtrar los libros mostrados
  const filtrarLibros = libros.filter((libro) => {
    // La condición de búsqueda ahora solo filtra libros por título o autor
    const coincideBusqueda =
      libro.title.toLowerCase().includes(busqueda.toLowerCase()) ||
      libro.author.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "" ||
      (libro.categories &&
        libro.categories.some((cat) => cat.name === categoria));

    const coincideIdioma = idioma === "" || libro.idioma === idioma;
    const coincideEstado = estado === "" || libro.estado === estado;
    const coincideEditorial =
      editorial === "" ||
      (libro.editorial &&
        libro.editorial.toLowerCase().includes(editorial.toLowerCase()));
    const coincideEdicion =
      edicion === "" ||
      (libro.edicion &&
        libro.edicion.toLowerCase().includes(edicion.toLowerCase()));

    // NUEVA CONDICIÓN DE FILTRO: Ocultar los libros del usuario logeado
    const noEsMiLibro = !ocultarMisLibros || libro.user_id !== loggedInUserId;

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideIdioma &&
      coincideEstado &&
      coincideEditorial &&
      coincideEdicion &&
      noEsMiLibro // <-- AGREGAMOS LA NUEVA CONDICIÓN
    );
  });

  // Ordenar los libros filtrados alfabéticamente por título
  const librosOrdenados = [...filtrarLibros].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBook(null);
  };

  // NUEVA FUNCION para limpiar la búsqueda
  const handleClearSearch = () => {
    setBusqueda("");
    setShowUserResultsDropdown(false);
  };

  // NUEVA FUNCIÓN para navegar al perfil de un usuario
  const handleViewProfile = (userId) => {
    navigate(`/perfil/${userId}`);
    setShowUserResultsDropdown(false);
    setBusqueda("");
  };

  return (
    <div className="home-wrapper">
      <div className="hero-section">
        <h1>Intercambiá libros con tu comunidad</h1>
        <p>
          Descubrí nuevas historias y compartí las tuyas con lectores
          apasionados
        </p>
        {/* Contenedor principal para la barra de búsqueda y el dropdown */}
        <div className="search-bar-container">
          <div className="search-bar">
            <input
              className="search-input"
              type="text"
              placeholder="Buscá por título, autor o nombre de usuario"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {/* BOTÓN PARA LIMPIAR EL CAMPO DE BÚSQUEDA */}
            {busqueda.trim() !== "" && (
              <button
                className="clear-search-btn"
                onClick={handleClearSearch}
                aria-label="Limpiar búsqueda"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {/* NUEVO DROPDOWN de resultados de búsqueda de usuarios */}
          {showUserResultsDropdown && (
            <div className="user-search-dropdown">
              {loadingUserSearch && (
                <div className="dropdown-item loading-message">
                  Buscando usuarios...
                </div>
              )}

              {!loadingUserSearch && userSearchResults.length > 0 && (
                <>
                  {userSearchResults.map((user) => (
                    <div
                      key={user.id}
                      className="dropdown-item user-result"
                      onClick={() => handleViewProfile(user.id)}
                    >
                      <div className="user-info">
                        {/* CAMBIO AQUI: Usamos la URL de la foto de perfil si existe, sino, usamos el placeholder */}
                        <img
                          src={
                            user.profile_picture_url
                              ? `http://localhost:8000${user.profile_picture_url}`
                              : `https://placehold.co/40x40/E5E7EB/4B5563?text=${user.username[0].toUpperCase()}`
                          }
                          alt={`Avatar de ${user.username}`}
                          className="user-avatar"
                        />
                        <p className="username">{user.username}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {!loadingUserSearch &&
                userSearchResults.length === 0 &&
                busqueda.trim() !== "" && (
                  <div className="dropdown-item no-results-message">
                    No se encontraron usuarios.
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      <div className="main-section">
        <aside className="sidebar-filtros">
          <h3>Filtros</h3>

          <label>Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {TODAS_LAS_CATEGORIAS.map((cat) => (
              <option key={cat.id} value={cat.nombre}>
                {cat.nombre}
              </option>
            ))}
          </select>

          <label>Idioma</label>
          <select value={idioma} onChange={(e) => setIdioma(e.target.value)}>
            <option value="">Todos los idiomas</option>
            {TODOS_LOS_IDIOMAS.map((idiomaOpcion) => (
              <option key={idiomaOpcion.id} value={idiomaOpcion.nombre}>
                {idiomaOpcion.nombre}
              </option>
            ))}
          </select>

          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Cualquier estado</option>
            {TODOS_LOS_ESTADOS.map((estadoOpcion) => (
              <option key={estadoOpcion.id} value={estadoOpcion.nombre}>
                {estadoOpcion.nombre}
              </option>
            ))}
          </select>
        </aside>
        <section className="libros-section">
          {/* Contenedor con Flexbox para el título y el checkbox */}
          <div className="libros-header">
            <h3>Libros disponibles</h3>
            {/* El botón ahora es el div completo, y su clase cambia con el estado */}
            {loggedInUserId && (
              <div
                className={`checkbox-container ${
                  ocultarMisLibros ? "pressed-button" : ""
                }`}
                onClick={() => setOcultarMisLibros(!ocultarMisLibros)}
                role="button"
                tabIndex="0"
              >
                <label>
                  {ocultarMisLibros
                    ? "Mostrar mis libros"
                    : "Ocultar mis libros"}
                </label>
              </div>
            )}
          </div>

          <div className="cards-container">
            {librosOrdenados.length === 0 ? (
              <p>No se encontraron libros.</p>
            ) : (
              librosOrdenados.map((libro) => (
                <BookCard
                  key={libro.id}
                  book={libro}
                  isOwnedByCurrentUser={libro.user_id === loggedInUserId}
                  showHighlight={libro.user_id === loggedInUserId}
                >
                  <button
                    className="detalles-btn"
                    onClick={() => handleViewDetails(libro)}
                  >
                    Ver detalles
                  </button>
                </BookCard>
              ))
            )}
          </div>
        </section>
      </div>

      {showDetailsModal && selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseDetailsModal}
          loggedInUserId={loggedInUserId}
        />
      )}
    </div>
  );
};

export default HomePage;
