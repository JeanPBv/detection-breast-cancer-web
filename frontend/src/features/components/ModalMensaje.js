import React from 'react';

const ModalMensaje = ({ show, type, title, message, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message" style={{ whiteSpace: 'pre-line' }}>{message}</p>

        {type === "alert" && (
          <button onClick={onClose} style={{ backgroundColor: '#ef4444' }}>Cerrar</button>
        )}

        {(type === "confirm" || type === "confirm-guardar" || type === "confirm-eliminar") && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button onClick={onClose} style={{ backgroundColor: '#ef4444' }}>Cancelar</button>
            <button onClick={onConfirm} style={{ backgroundColor: '#6d5dfc' }}>Aceptar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalMensaje;