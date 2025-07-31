import React from "react";
import "../styles/ModalContacto.css";

function ModalContacto({ email, telefono, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Contactar al propietario</h3>
        <div className="modal-buttons">
          <a href={`mailto:${email}`} className="modal-btn mail-btn">
            📧 Contactar por Mail
          </a>
          <a href={`https://wa.me/${telefono}`} target="_blank" rel="noopener noreferrer" className="modal-btn wsp-btn">
            💬 Contactar por WhatsApp
          </a>
        </div>
        <button onClick={onClose} className="modal-close">Cerrar</button>
      </div>
    </div>
  );
}

export default ModalContacto;