// src/pages/BookDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBookById } from "../services/api";
import "../styles/BookDetailPage.css";

function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBookById(id);
        setBook(data);
      } catch (error) {
        console.error("Error al obtener el libro", error);
      }
    };
    fetchBook();
  }, [id]);

  if (!book) return <p>Cargando...</p>;

  return (
    <div className="book-detail-wrapper">
      <div className="book-detail-card">
        <img
          src={book.image_url ? `http://localhost:8000${book.image_url}` : "/placeholder.jpg"}
          alt={book.title}
          className="book-detail-img"
        />
        <div className="book-info">
          <h2>{book.title}</h2>
          <p><strong>Autor:</strong> {book.author}</p>
          <p><strong>Categoría:</strong> {book.category}</p>
          <p><strong>Idioma:</strong> {book.idioma}</p>
          <p><strong>Estado:</strong> {book.estado}</p>
          <p><strong>Publicado:</strong> {book.publication_date}</p>
          <p className="description">{book.description}</p>
          <button
            className="contact-btn"
            onClick={() => {
              navigate(`/mensajes?user_id=${book.usuario_id}`);
            }}
          >
            💬 Contactar propietario
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
