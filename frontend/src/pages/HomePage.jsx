import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBooks } from "../services/api";
import "../styles/HomePage.css";

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
        <p>Descubrí nuevas historias y compartí las tuyas con lectores apasionados</p>
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
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            <option value="Fantasía">Fantasía</option>
            <option value="Misterio">Misterio</option>
            <option value="Biografía">Biografía</option>
            <option value="Educativo">Educativo</option>
            <option value="Ficción">Ficción</option>
            <option value="No ficción">No ficción</option>
            <option value="Infantil">Infantil</option>
            <option value="Juvenil">Juvenil</option>
            <option value="Ciencia">Ciencia</option>
            <option value="Historia">Historia</option>
            <option value="Romance">Romance</option>
            <option value="Terror">Terror</option>
            <option value="Autoayuda">Autoayuda</option>
            <option value="Otros">Otros</option>
          </select>

          <label>Idioma</label>
          <select value={idioma} onChange={(e) => setIdioma(e.target.value)}>
            <option value="">Todos los idiomas</option>
            <option value="Español">Español</option>
            <option value="Inglés">Inglés</option>
            <option value="Portugués">Portugués</option>
            <option value="Francés">Francés</option>
            <option value="Italiano">Italiano</option>
          </select>

          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Cualquier estado</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Muy bueno">Muy bueno</option>
            <option value="Bueno">Bueno</option>
            <option value="Usado">Usado</option>
          </select>
        </aside>

        <section className="libros-section">
          <div className="libros-header">
            <h3>Libros disponibles</h3>
            <span>{filtrarLibros.length} libros encontrados</span>
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
                  <p className="autor">{libro.author}</p>
                  <p className="idioma">{libro.idioma}</p>
                  <span className={`estado-label ${libro.estado?.toLowerCase().replace(" ", "-")}`}>
                    {libro.estado || "Sin estado"}
                  </span>
                  <p className="usuario"><strong>{libro.usuario_nombre}</strong></p>
                  <button onClick={() => navigate(`/libros/${libro.id}`)}>Ver detalles</button>
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
