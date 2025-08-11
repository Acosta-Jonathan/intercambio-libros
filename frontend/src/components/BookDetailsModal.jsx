import React, { useState, useEffect } from "react";
import "../styles/BookDetailsModal.css";
import { getUserContact } from "../services/api";
import ModalContacto from "./ModalContacto";

const BookDetailsModal = ({ book, onClose, loggedInUserId }) => {
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [loadingOwner, setLoadingOwner] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case "Nuevo":
      case "Muy bueno":
        return "badge-green";
      case "Usado":
        return "badge-orange";
      case "Con algunos daños":
        return "badge-red";
      default:
        return "badge-gray";
    }
  };

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      if (book && book.user_id) {
        setLoadingOwner(true);
        try {
          const details = await getUserContact(book.user_id);
          setOwnerDetails(details);
        } catch (error) {
          console.error("Error al obtener detalles del propietario:", error);
          setOwnerDetails(null);
        } finally {
          setLoadingOwner(false);
        }
      }
    };

    fetchOwnerDetails();
  }, [book]);

  const handleContactClick = () => {
    setShowContactModal(true);
  };

  const isBookOwner = book.user_id === loggedInUserId;

  if (!book) {
    return null;
  }

  return (
    <div className="modal-backdrop-details">
      <div className="modal-content-details">
        <div className="modal-header-details">
          <h2>Detalles del Libro</h2>
          <button className="close-button-details" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body-details">
          <div className="modal-book-image-container">
            <img
              src={
                book.image_url
                  ? `http://localhost:8000${book.image_url}`
                  : "/default-book.svg"
              }
              alt={book.title}
            />
          </div>
          <h3>{book.title}</h3>
          <p>
            <strong>Autor:</strong> {book.author}
          </p>
          <p>
            <strong>Editorial:</strong> {book.editorial || "-"}
          </p>
          <p>
            <strong>Edición:</strong> {book.edicion || "-"}
          </p>
          <p>
            <strong>Año de Publicación:</strong> {book.publication_date || "-"}
          </p>
          <div className="book-badges">
            {book.estado && (
              <span
                className={`badge badge-strong ${getEstadoBadgeClass(
                  book.estado
                )}`}
              >
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
          <div className="book-description">
            <h4>
              <strong>Descripción</strong>
            </h4>
            <p>{book.description || "Sin descripción disponible."}</p>
          </div>
          <div className="categorias-section-details">
            <h4>
              <strong>Categorías</strong>
            </h4>
            <div className="categorias-list-details">
              {book.categories && book.categories.length > 0 ? (
                book.categories.map((categoria, index) => (
                  <span key={index} className="badge badge-strong badge-purple">
                    {categoria.name}
                  </span>
                ))
              ) : (
                <span className="badge badge-strong badge-purple">
                  Sin categoría
                </span>
              )}
            </div>
          </div>
          <p>
            <strong>Publicado por:</strong>{" "}
            {loadingOwner
              ? "Cargando..."
              : ownerDetails
              ? ownerDetails.username
              : "Usuario desconocido"}
          </p>
        </div>
        <div className="modal-footer-details">
          <button
            className="contactar-btn"
            onClick={handleContactClick}
            disabled={isBookOwner}
          >
            Contactar
          </button>
          <button className="btn btn-outline-danger" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
      {showContactModal && ownerDetails && (
        <ModalContacto
          email={ownerDetails.email}
          telefono={ownerDetails.telefono}
          nombreLibro={book.title}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
};

export default BookDetailsModal;
