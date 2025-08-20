import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createBook, uploadBookImage } from "../services/api";
import "../styles/CrearLibroPage.css";

import {
  TODAS_LAS_CATEGORIAS,
  TODOS_LOS_ESTADOS,
  TODOS_LOS_IDIOMAS,
  TODAS_LAS_EDICIONES,
} from "../data/constants";

const CrearLibroPage = () => {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [editorial, setEditorial] = useState("");
  const [edicion, setEdicion] = useState("");
  const [anioPublicacion, setAnioPublicacion] = useState(""); // ✅ AÑADIDO: Nuevo estado para el año de publicación
  const [idioma, setIdioma] = useState("");
  const [estado, setEstado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function handleCategoriaCheckbox(e) {
    const { value, checked } = e.target;
    setCategoriasSeleccionadas((prev) =>
      checked ? [...prev, value] : prev.filter((catName) => catName !== value)
    );
  }

  // ✅ NUEVO: Función para manejar el archivo soltado o pegado
  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImagenPreview(URL.createObjectURL(file));
      setImagenFile(file);
    }
  };

  // ✅ NUEVO: Manejo de arrastrar y soltar
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setErrorMessage("");
    if (categoriasSeleccionadas.length === 0) {
      setError("Selecciona al menos una categoría.");
      return;
    }
    setLoading(true);
    try {
      const libro = {
        title: titulo,
        author: autor,
        editorial,
        edicion,
        publication_date: anioPublicacion
          ? parseInt(anioPublicacion, 10)
          : null, // ✅ AÑADIDO: Campo de año
        categories: categoriasSeleccionadas,
        idioma,
        estado,
        description: descripcion,
      };
      const nuevoLibro = await createBook(libro, token);
      if (imagenFile) {
        await uploadBookImage(nuevoLibro.id, imagenFile, token);
      }

      setSuccessMessage("Libro publicado con éxito.");

      setTimeout(() => {
        navigate("/mis-libros");
      }, 2000);
    } catch (error) {
      setErrorMessage(
        "Error al publicar libro. Ver consola para más detalles."
      );
      console.error("Error al publicar libro:", error);
    }
    setLoading(false);
  };

  return (
    <div className="crear-libro-container">
      <h2>Publicar un libro</h2>
      <p className="subtitulo">Comparte tu libro con la comunidad</p>
      <form onSubmit={handleSubmit}>
        <div className="fila-doble">
          <div>
            <label htmlFor="titulo">Título del libro</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="autor">Autor</label>
            <input
              id="autor"
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="fila-doble">
          <div>
            <label htmlFor="editorial">Editorial</label>
            <input
              id="editorial"
              type="text"
              value={editorial}
              onChange={(e) => setEditorial(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edicion">Edición</label>
            <select
              id="edicion"
              value={edicion}
              onChange={(e) => setEdicion(e.target.value)}
            >
              <option value="">Seleccionar Edición</option>
              {TODAS_LAS_EDICIONES.map((edicionOpcion) => (
                <option key={edicionOpcion.id} value={edicionOpcion.nombre}>
                  {edicionOpcion.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="fila-doble">
          <div>
            <label htmlFor="anioPublicacion">Año de publicación</label>
            <input
              id="anioPublicacion"
              type="number"
              pattern="\d{4}"
              maxLength="4"
              value={anioPublicacion}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 4) {
                  setAnioPublicacion(value);
                }
              }}
            />
          </div>
          <div>
            <label htmlFor="idioma">Idioma</label>
            <select
              id="idioma"
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
              required
            >
              <option value="">Seleccionar idioma</option>
              {TODOS_LOS_IDIOMAS.map((idiomaOpcion) => (
                <option key={idiomaOpcion.id} value={idiomaOpcion.nombre}>
                  {idiomaOpcion.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
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
        <div>
          <label>Estado del libro</label>
          <div className="estado-opciones">
            {TODOS_LOS_ESTADOS.map((estadoOpcion) => (
              <label key={estadoOpcion.id}>
                <input
                  type="radio"
                  name="estado"
                  value={estadoOpcion.nombre}
                  checked={estado === estadoOpcion.nombre}
                  onChange={(e) => setEstado(e.target.value)}
                  required
                />
                {estadoOpcion.nombre}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="descripcion">Descripción (opcional)</label>
          <textarea
            id="descripcion"
            placeholder="Cuéntanos más sobre el libro, su estado, por qué lo quieres intercambiar..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div
          className={`subir-imagen ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label htmlFor="imagen">
            {imagenPreview
              ? "Cambiar imagen"
              : "📤 Selecciona o arrastra una imagen aquí"}
          </label>
          <input
            type="file"
            id="imagen"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          {imagenPreview && (
            <img src={imagenPreview} alt="Preview" className="preview-img" />
          )}
        </div>
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="botones">
          <button
            type="button"
            className="cancelar"
            onClick={() => navigate("/")}
          >
            Cancelar
          </button>
          <button type="submit" className="publicar" disabled={loading}>
            {loading ? "Publicando..." : "Publicar libro"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearLibroPage;
