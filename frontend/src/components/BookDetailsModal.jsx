// src/components/BookDetailsModal.jsx
import React, { useState, useEffect } from 'react'; // Importa useState y useEffect
import '../styles/BookDetailsModal.css';
import { iniciarConversacion, getUserContact } from '../services/api'; // Importa getUserContact
import { TODOS_LOS_ESTADOS, TODOS_LOS_IDIOMAS, TODAS_LAS_CATEGORIAS } from '../data/constants';

const BookDetailsModal = ({ book, onClose, loggedInUserId }) => {
  const [ownerDetails, setOwnerDetails] = useState(null); // Nuevo estado para los detalles del propietario
  const [loadingOwner, setLoadingOwner] = useState(true); // Estado de carga

  // Función para mapear el estado del libro a una clase de color de badge
  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case "Nuevo":
      case "Muy bueno":
        return "badge-green";
      case "Bueno":
        return "badge-orange";
      case "Usado":
        return "badge-gray";
      case "Con algunos daños":
        return "badge-red";
      default:
        return "badge-gray";
    }
  };

  // ✨✨✨ Nuevo useEffect para cargar los detalles del propietario ✨✨✨
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      if (book && book.user_id) { // Solo si tenemos el libro y su user_id
        setLoadingOwner(true);
        try {
          const details = await getUserContact(book.user_id); // Llama a la API con el user_id
          setOwnerDetails(details);
        } catch (error) {
          console.error("Error al obtener detalles del propietario:", error);
          setOwnerDetails(null); // En caso de error, no mostrar detalles
        } finally {
          setLoadingOwner(false);
        }
      }
    };

    fetchOwnerDetails();
  }, [book]); // Se ejecutará cada vez que el 'book' cambie (cuando se abre el modal con un nuevo libro)


  const handleContactClick = async () => {
    try {
      await iniciarConversacion(book.user_id);
      alert('¡Conversación iniciada con el propietario del libro!');
      onClose();
    } catch (error) {
      console.error('Error al iniciar conversación:', error);
      alert('No se pudo iniciar la conversación. Inténtalo de nuevo.');
    }
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
          <button className="close-button-details" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body-details">
          <div className="modal-book-image-container">
            <img
              src={book.image_url ? `http://localhost:8000${book.image_url}` : "/default-book.svg"}
              alt={book.title}
            />
          </div>
          <h3>{book.title}</h3>
          <p><strong>Autor:</strong> {book.author}</p>

          <div className="book-badges">
            {book.estado && (
              <span className={`badge badge-strong ${getEstadoBadgeClass(book.estado)}`}>
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
            <h4><strong>Descripción</strong></h4>
            <p>{book.description || "Sin descripción disponible."}</p>
          </div>

          <div className="categorias-section-details">
            <h4><strong>Categorías</strong></h4>
            <div className="categorias-list-details">
              {book.categories && book.categories.length > 0 ? (
                book.categories.map((categoria, index) => (
                  <span key={index} className="badge badge-strong badge-purple">
                    {categoria.name}
                  </span>
                ))
              ) : (
                <span className="badge badge-strong badge-purple">Sin categoría</span>
              )}
            </div>
          </div>

          {/* ✨✨✨ Muestra el nombre de usuario del propietario ✨✨✨ */}
          <p>
            <strong>Publicado por:</strong>{' '}
            {loadingOwner ? 'Cargando...' : (ownerDetails ? ownerDetails.username : 'Usuario desconocido')}
          </p>
        </div>
        <div className="modal-footer-details">
          <button
            className="contactar-btn"
            onClick={handleContactClick}
            disabled={isBookOwner}
            style={isBookOwner ? { backgroundColor: '#cccccc', color: '#666666', cursor: 'not-allowed' } : {}}
          >
            Contactar
          </button>
          <button className="btn btn-outline-danger" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;