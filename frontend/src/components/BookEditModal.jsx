// components/BookEditModal.jsx
import React, { useState, useEffect } from "react";
import "../styles/BookEditModal.css";
import {
  TODAS_LAS_CATEGORIAS,
  TODOS_LOS_ESTADOS,
  TODOS_LOS_IDIOMAS,
} from "../data/constants";

const BookEditModal = ({ book, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
  });
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState("");

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
      });
      setEstadoSeleccionado(book.estado || "");
      setIdiomaSeleccionado(book.idioma || "");
      const categoriasNombres = book.categories.map((cat) => cat.name);
      setCategoriasSeleccionadas(categoriasNombres);
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEstadoChange = (e) => {
    setEstadoSeleccionado(e.target.value);
  };

  const handleIdiomaChange = (e) => {
    setIdiomaSeleccionado(e.target.value);
  };

  const handleCategoriaCheckbox = (e) => {
    const { value, checked } = e.target;
    setCategoriasSeleccionadas((prev) =>
      checked ? [...prev, value] : prev.filter((catName) => catName !== value)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      estado: estadoSeleccionado,
      idioma: idiomaSeleccionado,
      categories: categoriasSeleccionadas,
    };
    onSave(book.id, updatedData);
  };

  if (!book) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="modal-form"> {/* Añadimos una clase al form */}
          {/* Contenido principal del modal que será scrollable */}
          <div className="modal-scrollable-content">
            <div className="modal-body">
              <label>
                Título:
                <input type="text" name="title" value={formData.title} onChange={handleChange} />
              </label>
              <label>
                Autor:
                <input type="text" name="author" value={formData.author} onChange={handleChange} />
              </label>

              <div className="modal-row-fields">
                <label>
                  Estado:
                  <select name="estado" value={estadoSeleccionado} onChange={handleEstadoChange}>
                    <option value="">Selecciona un estado</option>
                    {TODOS_LOS_ESTADOS.map((estadoOpcion) => (
                      <option key={estadoOpcion.id} value={estadoOpcion.nombre}>
                        {estadoOpcion.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Idioma:
                  <select name="idioma" value={idiomaSeleccionado} onChange={handleIdiomaChange}>
                    <option value="">Selecciona un idioma</option>
                    {TODOS_LOS_IDIOMAS.map((idiomaOpcion) => (
                      <option key={idiomaOpcion.id} value={idiomaOpcion.nombre}>
                        {idiomaOpcion.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Categorías:
                <div className="categorias-checkboxes-edit">
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
                </label>
              <label>
                Descripción:
                <textarea name="description" value={formData.description} onChange={handleChange} />
              </label>
            </div>
          </div>
          {/* Fin del contenido scrollable */}

          {/* Pie de página del modal con los botones */}
          <div className="modal-footer">
            <button className="btn btn-outline-danger" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-outline-info" type="submit">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookEditModal;