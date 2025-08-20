import React, { useState, useEffect } from "react";
import "../styles/BookEditModal.css";
import {
    TODAS_LAS_CATEGORIAS,
    TODOS_LOS_ESTADOS,
    TODOS_LOS_IDIOMAS,
    TODAS_LAS_EDICIONES,
} from "../data/constants";

const placeholderImage = "https://placehold.co/100x100/E5E7EB/4B5563?text=Sin+Imagen";

const BookEditModal = ({ book, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        editorial: "",
        edicion: "",
        publication_date: "",
        description: "",
    });
    const [newImageFile, setNewImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(placeholderImage);
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
    const [idiomaSeleccionado, setIdiomaSeleccionado] = useState("");
    const [edicionSeleccionada, setEdicionSeleccionada] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (book) {
            setFormData({
                title: book.title || "",
                author: book.author || "",
                editorial: book.editorial || "",
                edicion: book.edicion || "",
                publication_date: book.publication_date ? String(book.publication_date) : "",
                description: book.description || "",
            });
            setEstadoSeleccionado(book.estado || "");
            setIdiomaSeleccionado(book.idioma || "");
            setEdicionSeleccionada(book.edicion || "");
            const categoriasNombres = book.categories.map((cat) => cat.name);
            setCategoriasSeleccionadas(categoriasNombres);
            setNewImageFile(null);
            const initialImageUrl = book.image_url ? `http://localhost:8000${book.image_url}` : placeholderImage;
            setPreviewImage(initialImageUrl);
        }
    }, [book]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "publication_date") {
            const isNumber = /^\d*$/.test(value);
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

    // ✅ NUEVO: Función para manejar el archivo soltado o pegado
    const handleFile = (file) => {
        if (file && file.type.startsWith("image/")) {
            setNewImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
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
        } else {
            setNewImageFile(null);
            setPreviewImage(book.image_url ? `http://localhost:8000${book.image_url}` : placeholderImage);
        }
    };
    // const handleImageChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         setNewImageFile(file);
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setPreviewImage(reader.result);
    //         };
    //         reader.readAsDataURL(file);
    //     } else {
    //         setNewImageFile(null);
    //         setPreviewImage(book.image_url ? `http://localhost:8000${book.image_url}` : placeholderImage);
    //     }
    // };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedData = {
            ...formData,
            publication_date: formData.publication_date ? parseInt(formData.publication_date, 10) : null,
            estado: estadoSeleccionado,
            idioma: idiomaSeleccionado,
            edicion: edicionSeleccionada,
            categories: categoriasSeleccionadas,
        };
        onSave(book.id, updatedData, newImageFile);
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
                            <div 
                                className={`image-edit-container ${isDragging ? "dragging" : ""}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <img
                                    src={previewImage}
                                    alt="Portada del libro"
                                    className="book-image-preview"
                                />
                                <label className="file-input-label">
                                    {isDragging ? "Suelta la imagen aquí" : "Cambiar imagen"}
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        style={{ display: "none" }}
                                    />
                                </label>
                            </div>
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
                                        <option value="" disabled>Selecciona un estado</option>
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