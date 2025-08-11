import React from "react";
import "../styles/BookCard.css";

/**
 * Componente que muestra la tarjeta de un libro.
 * @param {Object} props - Las props del componente.
 * @param {Object} props.book - Objeto con los datos del libro.
 * @param {boolean} props.showHighlight - Booleano para determinar si se debe mostrar el borde y el badge de 'Tu Libro'.
 * @param {React.ReactNode} props.children - Elementos hijos para la sección de acciones.
 */
const BookCard = ({ book, showHighlight, children }) => {

    /**
     * Devuelve la clase CSS correspondiente al estado del libro.
     * @param {string} estado - El estado del libro (e.g., "Nuevo", "Usado").
     * @returns {string} La clase CSS para el badge de estado.
     */
    const getEstadoClass = (estado) => {
        switch (estado) {
            case "Nuevo":
                return "estado-nuevo";
            case "Muy bueno":
                return "estado-muy-bueno";
            case "Usado":
                return "estado-usado";
            case "Con algunos daños":
                return "estado-danos";
            default:
                return "estado-default";
        }
    };

    return (
        // Aplica la clase 'libro-propio' solo si showHighlight es true.
        <div className={`libro-card ${showHighlight ? 'libro-propio' : ''}`}>
            
            {/* Muestra el badge 'Tu Libro' solo si showHighlight es true. */}
            {showHighlight && (
                <span className="badge-propio">Tu Libro</span>
            )}

            <div className="libro-imagen-container">
                <img
                    src={book.image_url ? `http://localhost:8000${book.image_url}` : "/default-book.svg"}
                    alt={book.title}
                />
            </div>

            <div className="libro-info-content">
                <h3 className="libro-titulo">{book.title}</h3>
                <p className="libro-autor">
                    <strong>Autor:</strong> {book.author}
                </p>
                {book.editorial && (
                    <p className="libro-editorial">
                        <strong>Editorial:</strong> {book.editorial}
                    </p>
                )}
                {book.edicion && (
                    <p className="libro-edicion">
                        <strong>Edición:</strong> {book.edicion}
                    </p>
                )}
                <div className="libro-etiquetas">
                    <span className={`etiqueta ${getEstadoClass(book.estado)}`}>
                        <strong>Estado:</strong> {book.estado || "No definido"}
                    </span>
                </div>
                <div className="categorias-container">
                    <p className="etiqueta-categoria-titulo">
                        <strong>Categorías:</strong>
                    </p>
                    <div className="categorias-list">
                        {book.categories && book.categories.length > 0 ? (
                            book.categories.map((categoria, index) => (
                                <span key={index} className="etiqueta-categoria">
                                    {categoria.name}
                                </span>
                            ))
                        ) : (
                            <span className="etiqueta-categoria">Sin categoría</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="acciones">
                {children}
            </div>
        </div>
    );
};

export default BookCard;