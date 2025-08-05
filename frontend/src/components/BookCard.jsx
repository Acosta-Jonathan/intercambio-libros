import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../styles/BookCard.css";

const BookCard = ({ book, onEdit, onDelete }) => {
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

  return (
    <div className="libro-card">
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
        <button onClick={() => onEdit(book)}>
          <FaEdit className="me-1" /> Editar
        </button>
        <button onClick={() => onDelete(book.id)}>
          <FaTrash className="me-1" /> Eliminar
        </button>
      </div>
    </div>
  );
};

export default BookCard;