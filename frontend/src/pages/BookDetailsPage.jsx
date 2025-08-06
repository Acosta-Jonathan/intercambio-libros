import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBookById, getUserContact } from "../services/api";
import ModalContacto from "../components/ModalContacto";
import "../styles/BookDetailPage.css";

function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [contactoUsuario, setContactoUsuario] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBookById(id);
        setBook(data);

        // Traer también datos de contacto del usuario dueño del libro
        if (data.user_id) {
          const contacto = await getUserContact(data.user_id);
          setContactoUsuario(contacto);
        }
      } catch (error) {
        console.error("Error al obtener el libro o el contacto", error);
      }
    };

    fetchBook();
  }, [id]);

  if (!book) return <p>Cargando...</p>;

  return (
    <div className="book-detail-wrapper">
      <div className="book-detail-card-horizontal">
        <div className="book-image-column">
          <img
            src={
              book.image_url
                ? `http://localhost:8000${book.image_url}`
                : "/default-book.svg"
            }
            alt={book.title}
            className="book-detail-img"
          />
        </div>

        <div className="book-info-column">
          <h2 className="book-title">{book.title}</h2>
          <p className="book-author">
            <strong>Autor: </strong>
            {book.author}
          </p>

          <div className="book-badges">
            {book.estado && (
              <span className="badge badge-strong badge-green">
                <strong>Estado: </strong>
                {book.estado}
              </span>
            )}
            {book.idioma && (
              <span className="badge badge-strong badge-gray">
                <strong>Idioma: </strong>
                {book.idioma}
              </span>
            )}
          </div>
          
            <div className="categorias-container">
              <p className="etiqueta-categoria-titulo">
                <strong>Categorías:</strong>
              </p>
              <div className="categorias-list">
                {book.categories && book.categories.length > 0 ? (
                  book.categories.map((categoria, index) => (
                    <span key={index} className="categoria-label">
                      {categoria.name}
                    </span>
                  ))
                ) : (
                  <span className="categoria-label">Sin categoría</span>
                )}
              </div>
            </div>

          <div className="book-description">
            <h4><strong>Descripción</strong></h4>
            <p>{book.description || "Sin descripción disponible."}</p>
          </div>

          <button className="contact-btn" onClick={() => setShowModal(true)}>
            💬 Contactar propietario
          </button>

          {/* Modal de contacto */}
          {showModal && contactoUsuario && (
            <ModalContacto
              email={contactoUsuario.email}
              telefono={contactoUsuario.telefono}
              onClose={() => setShowModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage;
