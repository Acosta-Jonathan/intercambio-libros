// src/pages/MisLibrosPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteBook,
  getMyBooks,
  updateBook,
  actualizarTelefono,
  updateBookImage,
} from "../services/api";
import "../styles/MiPerfilPage.css";
import { useNavigate } from "react-router-dom";
import { setUser } from "../store/authSlice";
import BookEditModal from "../components/BookEditModal";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
import ErrorModal from "../components/ErrorModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { FaEdit, FaTrash } from "react-icons/fa";

const MisLibrosPage = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [libros, setLibros] = useState([]);
  const [editandoLibro, setEditandoLibro] = useState(null);
  const [telefono, setTelefono] = useState(user?.telefono || "");
  const [showModal, setShowModal] = useState(false); // Modal para editar teléfono
  const [telefonoError, setTelefonoError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estados para el modal de detalles de libro
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Estado para el modal de confirmación de eliminación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [libroAEliminar, setLibroAEliminar] = useState(null);

  // Estados para el modal de error
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleConsultarClick = () => navigate("/crear-libro");

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const response = await getMyBooks(token);
        setLibros(response);
      } catch (error) {
        console.error("Error al obtener libros:", error);
      }
    };
    fetchLibros();
  }, [token]);

  useEffect(() => {
    if (editandoLibro || showModal || showDetailsModal || showConfirmModal || showErrorModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [editandoLibro, showModal, showDetailsModal, showConfirmModal, showErrorModal]);

  // Lógica para mostrar el modal de confirmación
  const handleEliminarClick = (id) => {
    setLibroAEliminar(id);
    setShowConfirmModal(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await deleteBook(libroAEliminar, token);
      setLibros((prev) => prev.filter((libro) => libro.id !== libroAEliminar));
    } catch (error) {
      setErrorMessage("Error al eliminar el libro. Por favor, inténtalo de nuevo.");
      setShowErrorModal(true);
    } finally {
      setShowConfirmModal(false);
      setLibroAEliminar(null);
    }
  };

  const handleEditarClick = (libro) => {
    setEditandoLibro(libro);
  };

  const handleGuardarEdicion = async (id, updatedData, imageFile) => {
    try {
      // 1. Actualizar los datos de texto del libro
      const updatedBookData = await updateBook(id, updatedData, token);

      let finalBook = updatedBookData;

      // 2. Si se proporcionó un archivo de imagen, subirlo
      if (imageFile) {
        finalBook = await updateBookImage(id, imageFile, token);
      }

      // Actualizar el estado de los libros con los datos finales
      setLibros((prevLibros) =>
        prevLibros.map((libro) => (libro.id === id ? finalBook : libro))
      );
      setEditandoLibro(null);
    } catch (error) {
      setErrorMessage("Error al actualizar el libro. Por favor, inténtalo de nuevo.");
      setShowErrorModal(true);
    }
  };

  const handleGuardarTelefono = async () => {
    const soloNumeros = /^\d{10,}$/;
    if (!soloNumeros.test(telefono)) {
      setTelefonoError(
        "El teléfono debe tener al menos 10 dígitos y solo números."
      );
      return;
    }
    try {
      const updatedUser = await actualizarTelefono(telefono, token);
      dispatch(setUser(updatedUser));
      setShowModal(false);
      setTelefonoError("");
    } catch (error) {
      setErrorMessage("Error al actualizar el teléfono. Por favor, inténtalo de nuevo.");
      setShowErrorModal(true);
    }
  };

  const handleViewDetails = (libro) => {
    setSelectedBook(libro);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBook(null);
  };

  return (
    <div className="container perfil-container mb-4">
      <div className="row align-items-center">
        <div className="col-md-9 d-flex align-items-center gap-3">
          <div className="perfil-avatar d-flex align-items-center justify-content-center">
            <i className="fas fa-user fa-2x text-white"></i>
          </div>
          <div>
            <h2 className="mb-1">{user?.username}</h2>
            <p className="mb-1">
              <i className="fas fa-envelope me-2 text-muted"></i>
              {user?.email}
            </p>
            <p className="mb-0 d-flex align-items-center">
              <i className="fas fa-phone me-2 text-muted"></i>
              {user?.telefono || "-"}
              <button
                className="btn btn-sm btn-outline-secondary ms-2"
                onClick={() => setShowModal(true)}
              >
                <i className="fas fa-edit"></i>
              </button>
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Teléfono</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ingrese su número"
                />
                {telefonoError && (
                  <div className="text-danger mt-2">{telefonoError}</div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleGuardarTelefono}
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <hr />
      <div className="d-flex justify-content-between align-items-center mt-4">
        <h2 className="h4 fw-bold text-dark">Mis libros publicados</h2>
        <button
          className="btn btn-primary text-white gradient-bg border-0"
          onClick={handleConsultarClick}
        >
          <i className="fas fa-plus me-2"></i>Publicar nuevo libro
        </button>
      </div>

      <br />
      <div className="row g-4">
        {libros.map((libro) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={libro.id}>
            <BookCard
              book={libro}
              isOwnedByCurrentUser={true}
            >
              <button
                className="detalles-btn full-width-btn"
                onClick={() => handleViewDetails(libro)}
              >
                Ver detalles
              </button>
              <div className="acciones-secundarias">
                <button onClick={() => handleEditarClick(libro)}>
                  <FaEdit className="me" />
                </button>
                <button onClick={() => handleEliminarClick(libro.id)}>
                  <FaTrash className="me" />
                </button>
              </div>
            </BookCard>
          </div>
        ))}
      </div>

      {editandoLibro && (
        <BookEditModal
          book={editandoLibro}
          onClose={() => setEditandoLibro(null)}
          onSave={handleGuardarEdicion}
        />
      )}

      {showDetailsModal && selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseDetailsModal}
          loggedInUserId={user?.id || null}
        />
      )}
      
      {/* Renderizado de los modales separados */}
      {showConfirmModal && (
        <ConfirmationModal
          message={`¿Estás seguro de que quieres eliminar el libro "${libros.find(l => l.id === libroAEliminar)?.title}"?`}
          onConfirm={handleConfirmarEliminar}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
};

export default MisLibrosPage;
