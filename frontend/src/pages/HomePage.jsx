import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBooks } from "../services/api";
import "../styles/HomePage.css";
import { TODAS_LAS_CATEGORIAS, TODOS_LOS_ESTADOS, TODOS_LOS_IDIOMAS } from "../data/constants";

const HomePage = () => {
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [idioma, setIdioma] = useState("");
  const [estado, setEstado] = useState("");
  const navigate = useNavigate();

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
    return (
      (libro.title.toLowerCase().includes(busqueda.toLowerCase()) ||
        libro.author.toLowerCase().includes(busqueda.toLowerCase())) &&
      (categoria === "" || libro.category === categoria) &&
      (idioma === "" || libro.idioma === idioma) &&
      (estado === "" || libro.estado === estado)
    );
  });

  return (
    <div className="home-wrapper">
      {/* Hero / Header */}
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

      {/* Zona de filtros + libros */}
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
                <div key={libro.id} className="libro-card">
                  <div className="img-wrapper">
                    <img
                      src={`http://localhost:8000${libro.image_url}`}
                      alt={libro.title}
                    />
                  </div>
                  <h4>{libro.title}</h4>
                  <p className="autor">
                    <strong>Autor:</strong> {libro.author}
                  </p>
                  <p className="idioma">
                    <strong>Idioma:</strong> {libro.idioma}</p>
                  <span
                    className={`estado-label ${libro.estado
                      ?.toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    <strong>Estado:</strong> {libro.estado || "No definido"}
                  </span>

                  <div className="categorias-container">
                    <p className="etiqueta-categoria-titulo">
                      <strong>Categorías:</strong>
                    </p>
                    <div className="categorias-list">
                      {libro.categories && libro.categories.length > 0 ? (
                        libro.categories.map((categoria, index) => (
                          <span key={index} className="categoria-label">
                            {categoria.name}
                          </span>
                        ))
                      ) : (
                        <span className="categoria-label">Sin categoría</span>
                      )}
                    </div>
                  </div>
                  <p className="usuario">
                    <strong>{libro.usuario_nombre}</strong>
                  </p>
                  <button
                    className="detalles-btn"
                    onClick={() => navigate(`/libros/${libro.id}`)}
                  >
                    Ver detalles
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
