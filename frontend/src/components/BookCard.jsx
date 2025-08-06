// src/components/BookCard.jsx
import React from "react";
import "../styles/BookCard.css";

// Añadimos la nueva prop 'showHighlight'
const BookCard = ({ book, isOwnedByCurrentUser, onDetailsClick, children, showHighlight = true }) => {
  const getEstadoClass = (estado) => {
    switch (estado) {
      case "Nuevo":
        return "estado-nuevo";
      case "Usado":
        return "estado-usado";
      case "Con algunos daños":
        return "estado-danos";
      default:
        return "estado-default";
    }
  };

  // Determinar si se debe aplicar el resaltado visual
  const applyVisualHighlight = isOwnedByCurrentUser && showHighlight;

  return (
    // Aplicamos la clase condicional 'libro-propio' solo si applyVisualHighlight es true
    <div className={`libro-card ${applyVisualHighlight ? 'libro-propio' : ''}`}>
      <div className="libro-imagen-container">
        <img
          src={
            book.image_url
              ? `http://localhost:8000${book.image_url}`
              : "/default-book.svg"
          }
          alt={book.title}
        />
      </div>
      {/* Badge condicional: solo si applyVisualHighlight es true */}
      {applyVisualHighlight && (
        <span className="badge-propio">Tu Libro</span>
      )}
      <div className="libro-info-content">
        <h3 className="libro-titulo">{book.title}</h3>
        <p className="libro-autor">
          <strong>Autor:</strong> {book.author}
        </p>
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