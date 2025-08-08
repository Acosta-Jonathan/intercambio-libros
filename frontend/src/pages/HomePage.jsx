// src/pages/HomePage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Importamos las nuevas funciones de nuestro servicio de API
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
  // Estados existentes
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [idioma, setIdioma] = useState("");
  const [estado, setEstado] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // NUEVOS estados para la búsqueda de usuarios en vivo
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

  // ✅ NUEVO EFECTO: Búsqueda de usuarios con "debounce"
  // Se activa cada vez que el valor de 'busqueda' cambia
  useEffect(() => {
    // Ocultar la lista de resultados si el campo está vacío
    if (busqueda.trim() === "") {
      setShowUserResultsDropdown(false);
      setUserSearchResults([]);
      return;
    }

    // Mostrar la lista y empezar a buscar
    setShowUserResultsDropdown(true);
    setLoadingUserSearch(true);

    // Configuración del debounce para evitar peticiones excesivas
    const timeoutId = setTimeout(async () => {
      try {
        // Llamada a la API para buscar usuarios
        const results = await searchUsers(busqueda);
        setUserSearchResults(results);
      } catch (error) {
        console.error("Error buscando usuarios:", error);
        setUserSearchResults([]);
      } finally {
        setLoadingUserSearch(false);
      }
    }, 500); // Esperar 500ms después de la última pulsación

    // Función de limpieza para cancelar el timeout
    return () => clearTimeout(timeoutId);
  }, [busqueda]);

  // Función para filtrar los libros mostrados en la sección principal
  // Ahora esta función se ejecuta automáticamente con cada cambio en 'busqueda'
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

    return (
      coincideBusqueda && coincideCategoria && coincideIdioma && coincideEstado
    );
  });

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
    // Ocultamos el dropdown y limpiamos el campo de búsqueda
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
        {/* ✅ MODIFICACIONES EN LA BARRA DE BÚSQUEDA */}
        <div className="search-bar-container">
          <div className="search-bar">
            <input
              className="search-input"
              type="text"
              placeholder="Buscá por título, autor o nombre de usuario"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {/* El botón de búsqueda manual ha sido eliminado */}
          </div>

          {/* ✅ NUEVA SECCIÓN PARA MOSTRAR LOS RESULTADOS DE USUARIOS */}
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
        </aside>
        <section className="libros-section">
          <div className="libros-header">
            <h3>Libros disponibles</h3>
          </div>

          <div className="cards-container">
            {filtrarLibros.length === 0 ? (
              <p>No se encontraron libros.</p>
            ) : (
              filtrarLibros.map((libro) => (
                <BookCard
                  key={libro.id}
                  book={libro}
                  isOwnedByCurrentUser={libro.user_id === loggedInUserId}
                  showHighlight={true}
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
