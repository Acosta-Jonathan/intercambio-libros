import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { deleteBook, getMyBooks, updateBook } from "../services/api";
import "../styles/MisLibrosPage.css";

const MisLibrosPage = () => {
  const token = useSelector((state) => state.auth.token);
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
    <div className="mis-libros-container">
      <h2>Mis Libros Publicados</h2>
      <div className="libros-grid">
        {libros.map((libro) => (
          <div key={libro.id} className="libro-card">
            <img src={libro.image_url ? `http://localhost:8000${libro.image_url}`: "https://via.placeholder.com/150"}alt={libro.title}/>
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
                <p>{libro.estado || "Estado no especificado"} - {libro.category || "Sin categoría"}</p>
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
};

export default MisLibrosPage;
