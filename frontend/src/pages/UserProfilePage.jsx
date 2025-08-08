// src/pages/UserProfilePage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile, getUserBooks } from "../services/api";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import "../styles/UserProfilePage.css"; // Usamos un nuevo archivo CSS
import { useSelector } from "react-redux";
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const loggedInUserId = useSelector((state) => state.auth.user?.id);

  const [userProfile, setUserProfile] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal de detalles de libro
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Efecto para cargar los datos del usuario y sus libros
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError("ID de usuario no proporcionado.");
        setLoading(false);
        return;
      }

      // Si el usuario ve su propio perfil, lo redirigimos a "MisLibrosPage"
      if (loggedInUserId && loggedInUserId.toString() === userId) {
        navigate("/mis-libros");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const profileData = await getUserProfile(userId);
        const booksData = await getUserBooks(userId);
        setUserProfile(profileData);
        setUserBooks(booksData);
      } catch (err) {
        console.error("Error al cargar el perfil del usuario:", err);
        setError("No se pudo cargar el perfil del usuario. Por favor, inténtelo de nuevo.");
        setUserProfile(null);
        setUserBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, loggedInUserId, navigate]);

  // Efecto para controlar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetailsModal]);

  const handleViewDetails = (libro) => {
    setSelectedBook(libro);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBook(null);
  };

  if (loading) {
    return <div className="loading-message">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!userProfile) {
    return <div className="error-message">Perfil de usuario no encontrado.</div>;
  }

  return (
    <div className="container user-profile-page-wrapper">
      <div className="perfil-container mb-4">
        <div className="row align-items-center">
          <div className="col-md-9 d-flex align-items-center gap-3">
            <div className="perfil-avatar d-flex align-items-center justify-content-center">
              <FaUser className="fa-2x text-white" />
            </div>
            <div>
              <h2 className="mb-1">{userProfile.username}</h2>
              <p className="mb-1">
                <FaEnvelope className="me-2 text-muted" />
                {userProfile.email}
              </p>
              <p className="mb-0 d-flex align-items-center">
                <FaPhone className="me-2 text-muted" />
                {userProfile.telefono || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div className="d-flex justify-content-between align-items-center mt-4">
        <h2 className="h4 fw-bold text-dark">Libros publicados por {userProfile.username}</h2>
      </div>

      <br />
      <div className="libros-grid">
        {userBooks.length > 0 ? (
          userBooks.map((libro) => (
            <BookCard
              key={libro.id}
              book={libro}
              isOwnedByCurrentUser={false}
              showHighlight={false}
            >
              <button
                className="detalles-btn full-width-btn"
                onClick={() => handleViewDetails(libro)}
              >
                Ver detalles
              </button>
            </BookCard>
          ))
        ) : (
          <div className="no-libros-message">Este usuario aún no ha publicado libros.</div>
        )}
      </div>

      {showDetailsModal && selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseDetailsModal}
          loggedInUserId={loggedInUserId}
        />
      )}
    </div>
  );
};

export default UserProfilePage;