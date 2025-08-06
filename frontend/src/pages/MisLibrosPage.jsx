// src/pages/MisLibrosPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteBook,
  getMyBooks,
  updateBook,
  actualizarTelefono,
} from "../services/api";
import "../styles/MisLibrosPage.css";
import { useNavigate } from "react-router-dom";
import { setUser } from "../store/authSlice";
import BookEditModal from "../components/BookEditModal";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";
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
    if (editandoLibro || showModal || showDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [editandoLibro, showModal, showDetailsModal]);


  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este libro?")) return;
    try {
      await deleteBook(id, token);
      setLibros((prev) => prev.filter((libro) => libro.id !== id));
    } catch (error) {
      console.error("Error al eliminar libro:", error);
      window.alert("No se pudo eliminar el libro.");
    }
  };

  const handleEditarClick = (libro) => {
    setEditandoLibro(libro);
  };

  const handleGuardarEdicion = async (id, updatedData) => {
    try {
      const updated = await updateBook(id, updatedData, token);
      setLibros((prevLibros) =>
        prevLibros.map((libro) => (libro.id === id ? updated : libro))
      );
      setEditandoLibro(null);
    } catch (error) {
      console.error("Error al actualizar libro:", error);
      window.alert("No se pudo actualizar el libro.");
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
      console.error("Error al actualizar teléfono:", error);
      window.alert("No se pudo actualizar el teléfono.");
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
      <div className="libros-grid">
        {libros.map((libro) => (
          <BookCard
            key={libro.id}
            book={libro}
            isOwnedByCurrentUser={true} // Sigue siendo true porque son sus libros
            showHighlight={false} // ✨✨✨ Pasamos showHighlight como false aquí ✨✨✨
          >
            <button
              className="detalles-btn full-width-btn"
              onClick={() => handleViewDetails(libro)}
            >
              Ver detalles
            </button>
            <div className="acciones-secundarias">
              <button onClick={() => handleEditarClick(libro)}>
                <FaEdit className="me-1" /> Editar
              </button>
              <button onClick={() => handleEliminar(libro.id)}>
                <FaTrash className="me-1" /> Eliminar
              </button>
            </div>
          </BookCard>
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
    </div>
  );
};

export default MisLibrosPage;