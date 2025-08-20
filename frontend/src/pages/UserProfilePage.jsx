// src/pages/UserProfilePage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile, getUserBooks } from "../services/api";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import "../styles/UserProfilePage.css";
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

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError("ID de usuario no proporcionado.");
        setLoading(false);
        return;
      }

      if (loggedInUserId && loggedInUserId.toString() === userId) {
        navigate("/mis-libros");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const profileData = await getUserProfile(userId);
        const booksData = await getUserBooks(userId);
console.log("Datos del perfil:", profileData);
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
            {userProfile.profile_picture_url ? (
              <div className="perfil-avatar">
                <img
                  src={`http://localhost:8000${userProfile.profile_picture_url}`}
                  alt="Foto de perfil"
                  className="img-fluid"
                />
              </div>
            ) : (
              <div className="perfil-avatar d-flex align-items-center justify-content-center">
                <FaUser className="fa-2x text-white" />
              </div>
            )}
            <div>
              <h2 className="mb-1">{userProfile.username}</h2>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div className="d-flex justify-content-between align-items-center mt-4">
        <h2 className="h4 fw-bold text-dark">Libros publicados por {userProfile.username}</h2>
      </div>

      <br />
      <div className="row g-4">
        {userBooks.length > 0 ? (
          userBooks.map((libro) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={libro.id}>
              <BookCard
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
            </div>
          ))
        ) : (
          <div className="no-libros-message col-12">Este usuario aún no ha publicado libros.</div>
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