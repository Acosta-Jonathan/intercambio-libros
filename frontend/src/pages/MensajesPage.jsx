// src/pages/MensajesPage.jsx
import React, { useState } from 'react';
import Conversaciones from '../components/mensajes/Conversaciones';
import Chat from '../components/mensajes/Chat';
import { useSelector } from 'react-redux'; // Para obtener el usuario actual

import '../styles/Mensajeria.css'; // Asegúrate de tener este CSS

const MensajesPage = () => {
  // Estado para la conversación seleccionada
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Obtener el objeto completo del usuario actual del store de Redux
  const currentUser = useSelector((state) => state.auth.user);

  // Si currentUser no está disponible (ej. no logueado), puedes mostrar un spinner,
  // redirigir al login o un mensaje de "No autenticado".
  if (!currentUser) {
    return <div>Cargando información del usuario o no autenticado...</div>;
  }

  return (
    <div className="messages-page-container">
      <div className="conversations-sidebar">
        <p className="current-user-info">Conversaciones</p>
        <Conversaciones
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation ? selectedConversation.id : null}
        />
      </div>
      <div className="chat-main-area">
        <Chat
          conversation={selectedConversation}
          // currentUser se pasa al Chat para que pueda saber si un mensaje es "suyo"
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default MensajesPage;