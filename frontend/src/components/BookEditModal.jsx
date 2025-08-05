// components/BookEditModal.jsx
import React, { useState, useEffect } from 'react';
import '../styles/BookEditModal.css';

// Las categorías deben ser las mismas que en CrearLibroPage
const TODAS_LAS_CATEGORIAS = [
  { id: "ficcion", nombre: "Ficción" },
  { id: "no-ficcion", nombre: "No Ficción" },
  { id: "fantasia", nombre: "Fantasía" },
  { id: "aventura", nombre: "Aventura" },
  { id: "infantil", nombre: "Infantil" },
  // ...agrega el resto de tus categorías
];

const BookEditModal = ({ book, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    estado: '',
    // No usamos 'category' aquí, usaremos el estado 'categoriasSeleccionadas'
  });
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        estado: book.estado || '',
      });
      // Inicializar las categorías seleccionadas con las del libro
      // asumiendo que `book.categories` es un array de objetos con `name`
      const categoriasNombres = book.categories.map(cat => cat.name);
      setCategoriasSeleccionadas(categoriasNombres);
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoriaCheckbox = (e) => {
    const { value, checked } = e.target;
    setCategoriasSeleccionadas((prev) =>
      checked ? [...prev, value] : prev.filter((catId) => catId !== value)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combina el formData con las categorías seleccionadas antes de guardar
    const updatedData = { ...formData, categories: categoriasSeleccionadas };
    onSave(book.id, updatedData);
  };

  if (!book) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Libro: {book.title}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>
              Título:
              <input type="text" name="title" value={formData.title} onChange={handleChange} />
            </label>
            <label>
              Autor:
              <input type="text" name="author" value={formData.author} onChange={handleChange} />
            </label>
            <label>
              Estado:
              <input type="text" name="estado" value={formData.estado} onChange={handleChange} />
            </label>
            <fieldset>
              <legend>Categorías:</legend>
              <div className="categorias-checkboxes">
                {TODAS_LAS_CATEGORIAS.map((cat) => (
                  <label key={cat.id} className="categoria-checkbox">
                    <input
                      type="checkbox"
                      value={cat.nombre}
                      checked={categoriasSeleccionadas.includes(cat.nombre)}
                      onChange={handleCategoriaCheckbox}
                    />
                    <span>{cat.nombre}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookEditModal;