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
    const [idioma, setIdioma] = useState("");
    const [estado, setEstado] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [imagenPreview, setImagenPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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
        setSuccessMessage(""); // Limpiar mensajes
        setErrorMessage(""); // Limpiar mensajes
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
                categories: categoriasSeleccionadas,
                idioma,
                estado,
                description: descripcion,
            };
            const nuevoLibro = await createBook(libro, token);
            if (imagenFile) {
                await uploadBookImage(nuevoLibro.id, imagenFile, token);
            }
            // Reemplazado el alert por un mensaje en el estado
            setSuccessMessage("Libro publicado con éxito.");
            
            setTimeout(() => {
                navigate("/mis-libros");
            }, 2000); // Redirige después de 2 segundos para que el usuario vea el mensaje

        } catch (error) {
            setErrorMessage("Error al publicar libro. Ver consola para más detalles.");
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
                {/* Mostramos el mensaje de éxito o error */}
                {successMessage && <div className="success-message">{successMessage}</div>}
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
