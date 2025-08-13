import React from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/Modals.css';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Confirmar</h5>
          <button type="button" className="modal-close-btn" onClick={onCancel}>
            <FaTimes size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="modal-btn modal-btn-danger" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
