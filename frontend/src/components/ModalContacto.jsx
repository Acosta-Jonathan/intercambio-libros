import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ModalContacto.css";

const ModalContacto = ({ email, telefono, nombreLibro, onClose, ownerId }) => {
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const navigate = useNavigate();

  const handleEmailClick = () => setShowEmailOptions(true);
  const isWhatsAppDisabled = !telefono;
  const asunto = `Intercambio de Libro - ${nombreLibro}`;

  const handleDirectMessage = () => {
    navigate(`/chat`, { state: { targetUserId: ownerId } });
    onClose();
  };

  return (
    <div className="modal-backdrop-contacto">
      <div className="modal-content-contacto">
        <div className="modal-header-contacto">
          <h2>Contactar al propietario</h2>
          <button className="close-button-contacto" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body-contacto">
          {ownerId && (
            <div className="contact-section">
              <h3>Mensaje Directo</h3>
              <button className="contact-btn dm-btn" onClick={handleDirectMessage}>
                Iniciar conversación
              </button>
            </div>
          )}

          <div className="contact-section">
            <h3>WhatsApp</h3>
            <a
              href={!isWhatsAppDisabled ? `https://wa.me/${telefono}` : "#"}
              className={`contact-btn wsp-btn ${isWhatsAppDisabled ? "disabled" : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => isWhatsAppDisabled && e.preventDefault()}
            >
              Contactar por WhatsApp
            </a>
          </div>

          {email && (
            <div className="contact-section">
              <h3>Mail</h3>
              {!showEmailOptions && (
                <button className="contact-btn mail-btn" onClick={handleEmailClick}>
                  Contactar por correo
                </button>
              )}

              {showEmailOptions && (
                <div className="email-options">
                  <p className="email-options-title">Selecciona un cliente de correo:</p>

                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(asunto)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="email-btn gmail-btn"
                  >
                    <span>Gmail</span>
                  </a>

                  <a
                    href={`https://outlook.live.com/mail/0/?to=${email}&subject=${encodeURIComponent(asunto)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="email-btn outlook-btn"
                  >
                    <span>Outlook</span>
                  </a>

                  <a
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
