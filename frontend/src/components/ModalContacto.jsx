// src/components/ModalContacto.jsx

import React, { useState } from 'react';
import '../styles/ModalContacto.css';

const ModalContacto = ({ email, telefono, nombreLibro, onClose }) => {
    const [showEmailOptions, setShowEmailOptions] = useState(false);

    const handleEmailClick = () => {
        setShowEmailOptions(true);
    };

    const isWhatsAppDisabled = !telefono;

    // Se crea la cadena del asunto del correo con el nombre del libro
    const asunto = `Intercambio de Libro - ${nombreLibro}`;

    return (
        <div className="modal-backdrop-contacto">
            <div className="modal-content-contacto">
                <div className="modal-header-contacto">
                    <h2>Contactar al propietario</h2>
                    <button className="close-button-contacto" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body-contacto">
                    {/* Botón de WhatsApp */}
                    <div className="contact-section">
                        <h3>WhatsApp</h3>
                        <a 
                            href={!isWhatsAppDisabled ? `https://wa.me/${telefono}` : '#'}
                            className={`contact-btn wsp-btn ${isWhatsAppDisabled ? 'disabled' : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                if (isWhatsAppDisabled) e.preventDefault();
                            }}
                        >
                            Contactar por WhatsApp
                        </a>
                    </div>
                    
                    {/* Sección de contacto por correo electrónico */}
                    {email && (
                        <div className="contact-section">
                            <h3>Mail</h3>
                            {/* Mostrar botón para contactar por mail si las opciones no están visibles */}
                            {!showEmailOptions && (
                                <button className="contact-btn mail-btn" onClick={handleEmailClick}>
                                    Contactar por correo
                                </button>
                            )}

                            {/* Mostrar opciones de correo si showEmailOptions es true */}
                            {showEmailOptions && (
                                <div className="email-options">
                                    <p className="email-options-title">Selecciona un cliente de correo:</p>
                                    <a 
                                        // Se añade el asunto a la URL de Gmail
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(asunto)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="email-btn gmail-btn"
                                    >
                                        <span>Gmail</span>
                                    </a>
                                    <a 
                                        // Se añade el asunto a la URL de Outlook
                                        href={`https://outlook.live.com/mail/0/?to=${email}&subject=${encodeURIComponent(asunto)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="email-btn outlook-btn"
                                    >
                                        <span>Outlook</span>
                                    </a>
                                    <a 
                                        // Se añade el asunto al enlace mailto
                                        href={`mailto:${email}?subject=${encodeURIComponent(asunto)}`}
                                        className="email-btn generic-btn"
                                    >
                                        <span>Otros...</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="modal-footer-contacto">
                    <button className="btn btn-outline-danger" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalContacto;