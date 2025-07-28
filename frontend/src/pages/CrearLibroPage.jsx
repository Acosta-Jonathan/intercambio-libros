import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createBook, uploadBookImage } from "../services/api";
import "../styles/CrearLibroPage.css";

const CrearLibroPage = () => {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [idioma, setIdioma] = useState("");
  const [estado, setEstado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);

  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenPreview(URL.createObjectURL(file));
      setImagenFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const libro = {
        title: titulo,
        author: autor,
        category: categoria,
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
      console.error("Error al publicar libro:", error);
      alert("Error al publicar libro. Ver consola.");
    }
  };

  return (
    <div className="crear-libro-container">
      <h2>Publicar un libro</h2>
      <p className="subtitulo">Compartí tu libro con la comunidad</p>

      <form onSubmit={handleSubmit}>
        <div className="fila-doble">
          <div>
            <label>Título del libro</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div>
            <label>Autor</label>
            <input type="text" value={autor} onChange={(e) => setAutor(e.target.value)} required />
          </div>
        </div>

        <div className="fila-doble">
          <div>
            <label>Categoría</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
              <option value="">Seleccionar categoría</option>
              <option value="Ficción">Ficción</option>
              <option value="No ficción">No ficción</option>
              <option value="Infantil">Infantil</option>
              <option value="Juvenil">Juvenil</option>
              <option value="Ciencia">Ciencia</option>
              <option value="Historia">Historia</option>
              <option value="Romance">Romance</option>
              <option value="Terror">Terror</option>
              <option value="Autoayuda">Autoayuda</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div>
            <label>Idioma</label>
            <select value={idioma} onChange={(e) => setIdioma(e.target.value)} required>
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
                />
                {opcion}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label>Descripción (opcional)</label>
          <textarea
            placeholder="Contanos más sobre el libro, su estado, por qué lo querés intercambiar..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="subir-imagen">
          <label htmlFor="imagen">📤seleccioná un archivo</label>
          <input type="file" id="imagen" accept="image/*" onChange={handleImageChange} />
          {imagenPreview && <img src={imagenPreview} alt="Preview" className="preview-img" />}
        </div>

        <div className="botones">
          <button type="button" className="cancelar" onClick={() => navigate("/")}>
            Cancelar
          </button>
          <button type="submit" className="publicar">
            Publicar libro
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearLibroPage;
