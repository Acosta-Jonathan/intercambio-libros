// src/components/mensajes/Conversaciones.jsx
import React, { useEffect, useState } from "react";
import { getUserConversations } from '../../services/messageService'; // Importa la función correcta
import '../../styles/Conversaciones.css';

const Conversaciones = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getUserConversations();
        if (Array.isArray(data)) {
            setConversations(data);
        } else {
            console.error("La API no devolvió un array para las conversaciones:", data);
            setError("Formato de datos de conversaciones inesperado.");
            setConversations([]);
        }
      } catch (err) {
        setError("Error al obtener las conversaciones.");
        console.error("Error completo al obtener conversaciones:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []); // Se ejecuta solo una vez al montar el componente

  const handleConversationClick = (conversation) => {
    onSelectConversation(conversation); // Pasa el objeto de conversación completo
  };

  return (
    <div className="conversations-list">
      {loading && <div className="conversations-loading">Cargando conversaciones...</div>}
      {error && <div className="conversations-error">{error}</div>}

      {!loading && !error && conversations.length === 0 && (
        <p className="no-conversations">No tienes conversaciones aún.</p>
      )}

      {!loading && !error && conversations.length > 0 && (
        conversations.map((conv) => (
          <div
            key={conv.id} // Usa el ID de la conversación como clave
            className={`conversation-item ${selectedConversationId === conv.id ? 'active' : ''}`}
            onClick={() => handleConversationClick(conv)}
          >
            {/* Muestra el username del 'other_user' */}
            <p className="conversation-user">
              {conv.other_user ? conv.other_user.username : 'Usuario desconocido'}
            </p>
            {/* Muestra el último mensaje y su timestamp */}
            <div className="conversation-info-row">
                <p className="last-message">
                    {conv.last_message_content ? conv.last_message_content : "No hay mensajes."}
                </p>
                <small className="timestamp">
                    {conv.last_message_timestamp ? new Date(conv.last_message_timestamp + 'Z').toLocaleString([], { 
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                      }) : ''}
                </small>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Conversaciones;