import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBooks } from "../services/api";
import "../styles/HomePage.css";
import { TODAS_LAS_CATEGORIAS, TODOS_LOS_ESTADOS, TODOS_LOS_IDIOMAS } from "../data/constants";
import { useSelector } from 'react-redux';
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";

const HomePage = () => {
    const [libros, setLibros] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");
    const [idioma, setIdioma] = useState("");
    const [estado, setEstado] = useState("");
    const [editorial, setEditorial] = useState(""); // <-- Nuevo estado para editorial
    const [edicion, setEdicion] = useState(""); // <-- Nuevo estado para edicion
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const navigate = useNavigate();

    const loggedInUser = useSelector((state) => state.auth.user);
    const loggedInUserId = loggedInUser?.id || null;

    useEffect(() => {
        const fetchLibros = async () => {
            try {
                // Aquí podrías pasar los parámetros de búsqueda a la API para filtrar en el backend,
                // lo que sería más eficiente. Por ahora, el filtro se hace en el frontend.
                const data = await getAllBooks();
                setLibros(data);
            } catch (error) {
                console.error("Error al cargar libros:", error);
            }
        };
        fetchLibros();
    }, []);

    useEffect(() => {
        if (showDetailsModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showDetailsModal]);


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
        const coincideEditorial = editorial === "" || (libro.editorial && libro.editorial.toLowerCase().includes(editorial.toLowerCase())); // <-- Nuevo filtro
        const coincideEdicion = edicion === "" || (libro.edicion && libro.edicion.toLowerCase().includes(edicion.toLowerCase())); // <-- Nuevo filtro


        return coincideBusqueda && coincideCategoria && coincideIdioma && coincideEstado && coincideEditorial && coincideEdicion;
    });

    const handleViewDetails = (book) => {
        setSelectedBook(book);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedBook(null);
    };

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
                    
                    {/* <-- Nuevos filtros de búsqueda */}
                    {/* <label>Editorial</label>
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
                    /> */}
                    {/* Fin de nuevos filtros --> */}
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