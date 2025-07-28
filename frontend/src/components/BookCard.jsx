// src/components/BookCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BookCard.css'; // Creamos estilo

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/libros/${book.id}`);
  };

  return (
    <div className="book-card">
      <div className="book-cover-placeholder" />
      <h4>{book.titulo}</h4>
      <p className="author">{book.autor}</p>
      <p className="estado">{book.estado}</p>
      <p className="idioma">{book.idioma}</p>
      <p className="propietario">👤 {book.usuario?.username || 'Desconocido'}</p>
      <button onClick={handleViewDetails} className="btn-detalles">Ver detalles</button>
    </div>
  );
};

export default BookCard;
