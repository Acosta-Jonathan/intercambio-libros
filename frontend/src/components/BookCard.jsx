import React from "react";
import "../styles/BookCard.css";
import { FaBookOpen, FaTags } from "react-icons/fa";

const BookCard = ({ book, isOwnedByCurrentUser, children, showHighlight }) => {

  if (!book) {
    return null;
  }

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Nuevo":
      case "Muy bueno":
        return "estado-nuevo";
      case "Usado":
        return "estado-usado";
      case "Con algunos daños":
        return "estado-danos";
      default:
        return "estado-default";
    }
  };

  return (
    // Se mantiene la clase 'animate-highlight' para el efecto de pulso en el borde.
    <div className={`libro-card ${showHighlight ? 'libro-propio animate-highlight' : ''}`}>
      
      {/* Se muestra el badge "Tu Libro" pero sin la clase de animación. */}
      {showHighlight && (
        <div className="badge-propio">Tu Libro</div>
      )}

      <div className="libro-imagen-container">
        <img
          src={book.image_url ? `http://localhost:8000${book.image_url}` : "https://placehold.co/300x400/E5E7EB/4B5563?text=Sin+Imagen"}
          alt={book.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/300x400/E5E7EB/4B5563?text=Sin+Imagen";
          }}
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
          <div className="etiqueta-estado-container">
            <FaBookOpen className="me-1 text-secondary" />
            <span className={`etiqueta ${getEstadoClass(book.estado)}`}>
              <strong>Estado:</strong> {book.estado || "No definido"}
            </span>
          </div>
          
          <div className="categorias-container">
            <div className="etiqueta-categoria-titulo">
              <FaTags className="me-1" />
              <strong>Categorías:</strong>
            </div>
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
      </div>
      
      <div className="acciones">
        {children}
      </div>
    </div>
  );
};

export default BookCard;
