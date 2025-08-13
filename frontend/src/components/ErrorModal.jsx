import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/Modals.css';

const ErrorModal = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title error">Error</h5>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <FaTimes size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;