import React from "react";
import "../styles/BookCard.css";

// CORRECCIÓN: Agregamos la prop `showHighlight` para controlar si se muestra el borde y el badge.
const BookCard = ({ book, isOwnedByCurrentUser, children, showHighlight }) => {
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
    // CORRECCIÓN: Usamos `showHighlight` para aplicar la clase condicionalmente.
    <div className={`libro-card ${showHighlight ? 'libro-propio' : ''}`}>
      <div className="libro-imagen-container">
        <img
          src={book.image_url ? `http://localhost:8000${book.image_url}` : "/default-book.svg"}
          alt={book.title}
        />
      </div>
      {/* CORRECCIÓN: Mostramos el badge solo si `showHighlight` es `true` */}
      {showHighlight && (
        <span className="badge-propio">Tu Libro</span>
      )}
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