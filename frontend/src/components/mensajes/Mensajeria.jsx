// src/components/mensajes/Mensajeria.jsx
import React, { useState } from "react";
import Conversaciones from './Conversaciones.jsx';
import Chat from './Chat.jsx';

import '../../styles/Mensajeria.css'; // Tus estilos

const Mensajeria = () => {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  // const token = useSelector((state) => state.auth.token); // Obtener el token del store si fuera necesario aquí

  const manejarSeleccion = (usuario) => {
    setUsuarioSeleccionado(usuario);
  };

  return (
    <div className="mensajeria-container">
      <div className="conversations-panel">
        <h2>Conversaciones</h2>
        <Conversaciones onSelectUser={manejarSeleccion} />
        <button className="new-chat-button">Iniciar Nuevo Chat</button>
      </div>

      {/* Panel de chat */}
      <div className="chat-panel">
        {usuarioSeleccionado ? (
          <Chat usuarioDestino={usuarioSeleccionado} />
        ) : (
          <p className="chat-placeholder">Selecciona una conversación para comenzar a chatear.</p>
        )}
      </div>
    </div>
  );
};

export default Mensajeria;