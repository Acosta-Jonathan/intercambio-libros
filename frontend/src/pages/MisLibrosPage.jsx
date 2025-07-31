import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { deleteBook, getMyBooks, updateBook } from "../services/api";
import "../styles/MisLibrosPage.css";


const MisLibrosPage = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [libros, setLibros] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    estado: "",
    category: "",
  });

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
    const confirmacion = confirm("¿Estás seguro de eliminar este libro?");
    if (!confirmacion) return;

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
      title: libro.title,
      author: libro.author,
      estado: libro.estado || "",
      category: libro.category || "",
    });
  };

  const handleEditarChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarEdicion = async (id) => {
    try {
      const updated = await updateBook(id, formData, token);
      setLibros((prevLibros) =>
        prevLibros.map((libro) => (libro.id === id ? updated : libro))
      );
      setEditandoId(null);
    } catch (error) {
      console.error("Error al actualizar libro:", error);
      alert("No se pudo actualizar el libro.");
    }
  };

 return (
  <div className="container perfil-container mb-4">
  <div className="row align-items-center">
    {/* Avatar y datos */}
    <div className="col-md-9 d-flex align-items-center gap-3">
      <div className="perfil-avatar d-flex align-items-center justify-content-center">
        <i className="fas fa-user fa-2x text-white"></i>
      </div>
      <div>
        <h2 className="mb-1">{user?.username}</h2>
        <p className="mb-1"><i className="fas fa-envelope me-2 text-muted"></i>{user?.email}</p>
        <p className="mb-0"><i className="fas fa-phone me-2 text-muted"></i>{user?.telefono || "+54 11 1234-5678"}</p>
      </div>
    </div>

    {/* Botón editar */}
    <div className="col-md-3 text-md-end mt-3 mt-md-0">
      <button className="btn btn-outline-primary">
        <i className="fas fa-edit me-2"></i>Editar perfil
      </button>
    </div>
  </div>
<br/>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="h4 fw-bold text-dark">Mis libros publicados</h2>
      <button className="btn btn-primary text-white gradient-bg border-0">
        <i className="fas fa-plus me-2"></i>Publicar nuevo libro
      </button>
    </div>

    <div className="libros-grid">
      {libros.map((libro) => (
        <div key={libro.id} className="libro-card">
          <img
            src={libro.image_url ? `http://localhost:8000${libro.image_url}` : "https://via.placeholder.com/150"}
            alt={libro.title}
          />
          {editandoId === libro.id ? (
            <div className="editor">
              <input name="title" value={formData.title} onChange={handleEditarChange} />
              <input name="author" value={formData.author} onChange={handleEditarChange} />
              <input name="estado" value={formData.estado} onChange={handleEditarChange} />
              <input name="category" value={formData.category} onChange={handleEditarChange} />
              <button onClick={() => handleGuardarEdicion(libro.id)}>Guardar</button>
              <button onClick={() => setEditandoId(null)}>Cancelar</button>
            </div>
          ) : (
            <>
              <h3>{libro.title}</h3>
              <p>{libro.author}</p>
              <p>
                {libro.estado || "Estado no especificado"} - {libro.category || "Sin categoría"}
              </p>
              <div className="acciones">
                <button onClick={() => handleEditarClick(libro)}>Editar</button>
                <button onClick={() => handleEliminar(libro.id)}>Eliminar</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  </div>
);
}

export default MisLibrosPage;
