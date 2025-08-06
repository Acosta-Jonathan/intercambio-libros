// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBooks } from "../services/api";
import "../styles/HomePage.css";
import { TODAS_LAS_CATEGORIAS, TODOS_LOS_ESTADOS, TODOS_LOS_IDIOMAS } from "../data/constants";
import { useSelector } from 'react-redux';
import BookCard from "../components/BookCard"; // Asegúrate de importar BookCard

const HomePage = () => {
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [idioma, setIdioma] = useState("");
  const [estado, setEstado] = useState("");
  const navigate = useNavigate();

  const loggedInUser = useSelector((state) => state.auth.user);
  // Acceso más seguro a loggedInUser.id
  const loggedInUserId = loggedInUser?.id || null; // Usa optional chaining (?.)

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

  const filtrarLibros = libros.filter((libro) => {
    const coincideBusqueda =
      libro.title.toLowerCase().includes(busqueda.toLowerCase()) ||
      libro.author.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === "" ||
      (libro.categories &&
        libro.categories.some(cat => cat.name === categoria));

    const coincideIdioma = idioma === "" || libro.idioma === idioma;
    const coincideEstado = estado === "" || libro.estado === estado;

    return coincideBusqueda && coincideCategoria && coincideIdioma && coincideEstado;
  });

  return (
    <div className="home-wrapper">
      <div className="hero-section">
        <h1>Intercambiá libros con tu comunidad</h1>
        <p>
          Descubrí nuevas historias y compartí las tuyas con lectores
          apasionados
        </p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscá por título o autor"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button>🔍</button>
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
                  // Acceso más seguro a libro.user_id
                  isOwnedByCurrentUser={libro.user_id === loggedInUserId}
                  onDetailsClick={() => navigate(`/libros/${libro.id}`)} // Pasa la función de navegación
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;