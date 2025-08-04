import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteBook, getMyBooks, updateBook, actualizarTelefono } from "../services/api";
import "../styles/MisLibrosPage.css";
import { useNavigate } from "react-router-dom";
import { setUser } from "../store/authSlice";

const TODAS_LAS_CATEGORIAS = [
  { id: "ficcion", nombre: "Ficción" },
  { id: "no-ficcion", nombre: "No Ficción" },
  { id: "fantasia", nombre: "Fantasía" },
  { id: "aventura", nombre: "Aventura" },
  { id: "infantil", nombre: "Infantil" },
  // ...agrega el resto
];

const MisLibrosPage = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [libros, setLibros] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    estado: "",
    categorias: [],
    descripcion: "",
    idioma: "",
    // Puedes agregar otros campos si los editas
  });

  const [telefono, setTelefono] = useState(user?.telefono || "");
  const [showModal, setShowModal] = useState(false);
  const [telefonoError, setTelefonoError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleConsultarClick = () => navigate('/crear-libro');

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

  const handleEliminar = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este libro?")) return;
    try {
      await deleteBook(id, token);
      setLibros((prev) => prev.filter((libro) => libro.id !== id));
    } catch (error) {
      console.error("Error al eliminar libro:", error);
      alert("No se pudo eliminar el libro.");
    }
  };

  const handleEditarClick = (libro) => {
    setEditandoId(libro.id);
    setFormData({
      title: libro.title || "",
      author: libro.author || "",
      estado: libro.estado || "",
      categorias: libro.categories
        ? libro.categories.map((cat) => (typeof cat === "string" ? cat : cat.id))
        : [],
      descripcion: libro.description || "",
      idioma: libro.idioma || "",
      // Ajusta otros campos si es necesario
    });
  };

  const handleEditarChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoriaCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      categorias: checked
        ? [...prev.categorias, value]
        : prev.categorias.filter((catId) => catId !== value),
    }));
  };

  const handleGuardarEdicion = async (id) => {
    try {
      const payload = {
        ...formData,
        categories: formData.categorias,
      };
      delete payload.categorias; // el backend espera 'categories'
      const updated = await updateBook(id, payload, token);
      setLibros((prevLibros) =>
        prevLibros.map((libro) => (libro.id === id ? updated : libro))
      );
      setEditandoId(null);
    } catch (error) {
      console.error("Error al actualizar libro:", error);
      alert("No se pudo actualizar el libro.");
    }
  };

  const handleGuardarTelefono = async () => {
    const soloNumeros = /^\d{10,}$/;
    if (!soloNumeros.test(telefono)) {
      setTelefonoError("El teléfono debe tener al menos 10 dígitos y solo números.");
      return;
    }

    try {
      const updatedUser = await actualizarTelefono(telefono, token);
      dispatch(setUser(updatedUser));
      setShowModal(false);
      setTelefonoError("");
    } catch (error) {
      console.error("Error al actualizar teléfono:", error);
      alert("No se pudo actualizar el teléfono.");
    }
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
              <i className="fas fa-envelope me-2 text-muted"></i>{user?.email}
            </p>
            <p className="mb-0 d-flex align-items-center">
              <i className="fas fa-phone me-2 text-muted"></i>
              {user?.telefono || "-"}
              <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => setShowModal(true)}>
                <i className="fas fa-edit"></i>
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Modal para editar teléfono */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Teléfono</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ingrese su número"
                />
                {telefonoError && <div className="text-danger mt-2">{telefonoError}</div>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleGuardarTelefono}>Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <hr />
      <div className="d-flex justify-content-between align-items-center mt-4">
        <h2 className="h4 fw-bold text-dark">Mis libros publicados</h2>
        <button className="btn btn-primary text-white gradient-bg border-0" onClick={handleConsultarClick}>
          <i className="fas fa-plus me-2"></i>Publicar nuevo libro
        </button>
      </div>

      <br />
      <div className="libros-grid">
        {libros.map((libro) => (
          <div key={libro.id} className="libro-card">
            <div className="libro-imagen-container">
              <img
                src={
                  libro.image_url
                    ? `http://localhost:8000${libro.image_url}`
                    : "/default-book.svg"
                }
                alt={libro.title}
              />
            </div>

            {editandoId === libro.id ? (
              <div className="editor">
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleEditarChange}
                  placeholder="Título"
                />
                <input
                  name="author"
                  value={formData.author}
                  onChange={handleEditarChange}
                  placeholder="Autor"
                />

                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleEditarChange}
                >
                  <option value="">Seleccionar estado</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Muy bueno">Muy bueno</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Usado">Usado</option>
                </select>

                {/* Selección múltiple de categorías */}
                <fieldset>
                  <legend>Categorías:</legend>
                  <div className="categorias-checkboxes">
                    {TODAS_LAS_CATEGORIAS.map((cat) => (
                      <label className="categoria-checkbox" key={cat.id}>
                        <input
                          type="checkbox"
                          value={cat.id}
                          checked={formData.categorias.includes(cat.id)}
                          onChange={handleCategoriaCheckbox}
                        />
                        <span>{cat.nombre}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <input
                  name="idioma"
                  value={formData.idioma}
                  onChange={handleEditarChange}
                  placeholder="Idioma"
                />

                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleEditarChange}
                  placeholder="Descripción"
                  rows={3}
                  style={{ width: "100%", borderRadius: 8, border: "1px solid #ccc", padding: "8px" }}
                />

                <button onClick={() => handleGuardarEdicion(libro.id)}>Guardar</button>
                <button onClick={() => setEditandoId(null)}>Cancelar</button>
              </div>
            ) : (
              <>
                <h3 className="libro-titulo">{libro.title}</h3>
                <p className="libro-autor">{libro.author}</p>
                <div className="libro-etiquetas">
                  {libro.estado && <span className="etiqueta">{libro.estado}</span>}
                  {/* Mostramos todas las categorías */}
                  {libro.categories &&
                    Array.isArray(libro.categories) &&
                    libro.categories.map((cat) =>
                      <span className="etiqueta-secundaria" key={typeof cat === "string" ? cat : cat.id}>
                        {typeof cat === "string" ? cat : cat.nombre || cat.name}
                      </span>
                    )}
                </div>
                <div className="acciones">
                  <button onClick={() => handleEditarClick(libro)}>
                    <i className="fas fa-pen"></i> Editar
                  </button>
                  <button onClick={() => handleEliminar(libro.id)}>
                    <i className="fas fa-trash"></i> Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisLibrosPage;