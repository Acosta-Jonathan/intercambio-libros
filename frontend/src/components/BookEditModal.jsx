import React, { useState, useEffect } from "react";
import "../styles/BookEditModal.css";
import {
  TODAS_LAS_CATEGORIAS,
  TODOS_LOS_ESTADOS,
  TODOS_LOS_IDIOMAS,
  TODAS_LAS_EDICIONES,
} from "../data/constants";

const BookEditModal = ({ book, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    editorial: "",
    edicion: "",
    publication_date: "",
    description: "",
  });
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState("");
  const [edicionSeleccionada, setEdicionSeleccionada] = useState("");

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        editorial: book.editorial || "",
        publication_date: book.publication_date ? String(book.publication_date) : "",
        description: book.description || "",
      });
      setEstadoSeleccionado(book.estado || "");
      setIdiomaSeleccionado(book.idioma || "");
      setEdicionSeleccionada(book.edicion || "");
      const categoriasNombres = book.categories.map((cat) => cat.name);
      setCategoriasSeleccionadas(categoriasNombres);
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Lógica de validación para el campo 'publication_date'
    if (name === "publication_date") {
      const isNumber = /^\d*$/.test(value); // Solo permite dígitos
      if (isNumber && value.length <= 4) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEstadoChange = (e) => {
    setEstadoSeleccionado(e.target.value);
  };

  const handleIdiomaChange = (e) => {
    setIdiomaSeleccionado(e.target.value);
  };

  const handleEdicionChange = (e) => {
    setEdicionSeleccionada(e.target.value);
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
      // Convierte el año a un número entero antes de guardar
      publication_date: formData.publication_date ? parseInt(formData.publication_date, 10) : null,
      estado: estadoSeleccionado,
      idioma: idiomaSeleccionado,
      edicion: edicionSeleccionada,
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
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-scrollable-content">
            <div className="modal-body">
              <label>
                Título:
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </label>
              <label>
                Autor:
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                />
              </label>
              <label>
                Editorial:
                <input
                  type="text"
                  name="editorial"
                  value={formData.editorial}
                  onChange={handleChange}
                />
              </label>
              <div className="modal-row-fields">
              <label>
                  Edición:
                  <select
                    name="edicion"
                    value={edicionSeleccionada}
                    onChange={handleEdicionChange}
                  >
                    <option value="">Selecciona una edicion</option>
                    {TODAS_LAS_EDICIONES.map((edicionOpcion) => (
                      <option key={edicionOpcion.id} value={edicionOpcion.nombre}>
                        {edicionOpcion.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              {/* Nuevo campo para el año de publicación con validación */}
              <label>
                Año de Publicación:
                <input
                  type="text"
                  name="publication_date"
                  value={formData.publication_date}
                  onChange={handleChange}
                />
              </label>
              </div>

              <div className="modal-row-fields">
                <label>
                  Estado:
                  <select
                    name="estado"
                    value={estadoSeleccionado}
                    onChange={handleEstadoChange}
                  >
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
                  <select
                    name="idioma"
                    value={idiomaSeleccionado}
                    onChange={handleIdiomaChange}
                  >
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
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button className="btn btn-outline-info" type="submit">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookEditModal;