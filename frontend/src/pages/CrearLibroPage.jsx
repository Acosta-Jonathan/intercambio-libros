import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createBook, uploadBookImage } from "../services/api";
import "../styles/CrearLibroPage.css";

const TODAS_LAS_CATEGORIAS = [
  { id: "ficcion", nombre: "Ficción" },
  { id: "no-ficcion", nombre: "No Ficción" },
  { id: "fantasia", nombre: "Fantasía" },
  { id: "aventura", nombre: "Aventura" },
  { id: "infantil", nombre: "Infantil" },
  // ...agrega el resto
];

const CrearLibroPage = () => {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [idioma, setIdioma] = useState("");
  const [estado, setEstado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [error, setError] = useState("");
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function handleCategoriaCheckbox(e) {
    const { value, checked } = e.target;
    setCategoriasSeleccionadas((prev) =>
      checked ? [...prev, value] : prev.filter((catName) => catName !== value)
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenPreview(URL.createObjectURL(file));
      setImagenFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (categoriasSeleccionadas.length === 0) {
      setError("Selecciona al menos una categoría.");
      return;
    }
    setLoading(true);
    try {
      const libro = {
        title: titulo,
        author: autor,
        categories: categoriasSeleccionadas,
        idioma,
        estado,
        description: descripcion,
      };
      const nuevoLibro = await createBook(libro, token);
      if (imagenFile) {
        await uploadBookImage(nuevoLibro.id, imagenFile, token);
      }
      alert("Libro publicado con éxito");
      navigate("/mis-libros");
    } catch (error) {
      setError("Error al publicar libro. Ver consola.");
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
            {error && <div className="error-message">{error}</div>}
          </fieldset>
          <div>
            <label htmlFor="idioma">Idioma</label>
            <select
              id="idioma"
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
              required
            >
              <option value="">Seleccionar idioma</option>
              <option value="Español">Español</option>
              <option value="Inglés">Inglés</option>
              <option value="Portugués">Portugués</option>
              <option value="Francés">Francés</option>
              <option value="Italiano">Italiano</option>
            </select>
          </div>
        </div>
        <div>
          <label>Estado del libro</label>
          <div className="estado-opciones">
            {["Nuevo", "Muy bueno", "Bueno", "Usado"].map((opcion) => (
              <label key={opcion}>
                <input
                  type="radio"
                  name="estado"
                  value={opcion}
                  checked={estado === opcion}
                  onChange={(e) => setEstado(e.target.value)}
                  required
                />
                {opcion}
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
        <div className="subir-imagen">
          <label htmlFor="imagen">📤 Selecciona un archivo</label>
          <input
            type="file"
            id="imagen"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagenPreview && (
            <img src={imagenPreview} alt="Preview" className="preview-img" />
          )}
        </div>
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