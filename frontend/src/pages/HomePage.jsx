import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Importamos las funciones necesarias
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
  // NUEVOS estados para los filtros de editorial y edición
  const [editorial, setEditorial] = useState("");
  const [edicion, setEdicion] = useState("");

  // Estados para el modal de detalles
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Estados para la búsqueda de usuarios
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [loadingUserSearch, setLoadingUserSearch] = useState(false);
  const [showUserResultsDropdown, setShowUserResultsDropdown] = useState(false);

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

  // Efecto para la búsqueda de usuarios con "debounce"
  useEffect(() => {
    if (busqueda.trim() === "") {
      setShowUserResultsDropdown(false);
      setUserSearchResults([]);
      return;
    }

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
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [busqueda]);

  // Función para filtrar los libros mostrados
  const filtrarLibros = libros.filter((libro) => {
    const coincideBusqueda =
      libro.title.toLowerCase().includes(busqueda.toLowerCase()) ||
      libro.author.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "" ||
      (libro.categories &&
        libro.categories.some((cat) => cat.name === categoria));

    const coincideIdioma = idioma === "" || libro.idioma === idioma;
    const coincideEstado = estado === "" || libro.estado === estado;
    // NUEVAS condiciones de filtro para editorial y edición
    const coincideEditorial =
      editorial === "" ||
      (libro.editorial &&
        libro.editorial.toLowerCase().includes(editorial.toLowerCase()));
    const coincideEdicion =
      edicion === "" ||
      (libro.edicion &&
        libro.edicion.toLowerCase().includes(edicion.toLowerCase()));

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideIdioma &&
      coincideEstado &&
      coincideEditorial &&
      coincideEdicion
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
        <div className="search-bar-container">
          <div className="search-bar">
            <input
              className="search-input"
              type="text"
              placeholder="Buscá por título, autor o nombre de usuario"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

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
                        <img
                          src={`https://placehold.co/40x40/E5E7EB/4B5563?text=${user.username[0].toUpperCase()}`}
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
          
          {/* NUEVOS FILTROS DE EDITORIAL Y EDICIÓN */}
          <label>Editorial</label>
          <input
            type="text"
            placeholder="Filtrar por editorial"
            value={editorial}
            onChange={(e) => setEditorial(e.target.value)}
          />

          <label>Edición</label>
          <input
            type="text"
            placeholder="Filtrar por edición"
            value={edicion}
            onChange={(e) => setEdicion(e.target.value)}
          />
        </aside>
        <section className="libros-section">
          <div className="libros-header">
            <h3>Libros disponibles</h3>
          </div>

          <div className="cards-container">
            {librosOrdenados.length === 0 ? (
              <p>No se encontraron libros.</p>
            ) : (
              librosOrdenados.map((libro) => (
                <BookCard
                  key={libro.id}
                  book={libro}
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
