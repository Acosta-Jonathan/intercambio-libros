// src/components/mensajes/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  getConversationMessages,
  sendMessage,
  markMessageAsSeen,
  markMessageAsRead,
  markMessageAsDelivered // Aunque delivered suele ser del backend, lo mantenemos por si lo necesitas
} from '../../services/messageService';
import { useSelector } from 'react-redux';
import '../../styles/Chat.css';

// Ahora recibe 'conversation' en lugar de 'usuarioDestino'
const Chat = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Obtener el ID del usuario actual del store de Redux
  const currentUserId = useSelector((state) => state.auth.user?.id);

  const loadMessages = async () => {
    if (!conversation) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getConversationMessages(conversation.id);
      if (Array.isArray(data)) {
        setMessages(data);

        // --- Lógica para marcar mensajes como vistos/leídos/entregados ---
        // Itera sobre los mensajes para marcar aquellos que son para el usuario actual
        data.forEach(async (msg) => {
            // Solo procesa mensajes si el usuario actual es el RECEPTOR
            // y el mensaje no ha sido marcado ya con ese estado.
            if (msg.receiver_id === currentUserId) {
                // Marcar como 'delivered' (entregado): el mensaje llegó al dispositivo del receptor.
                // Esta lógica es opcional aquí, ya que a menudo se maneja en el backend al enviar a un dispositivo
                // o al abrir la app. Pero si el backend no lo hace, el frontend puede enviarlo al cargar el chat.
                if (!msg.delivered) {
                    try {
                        await markMessageAsDelivered(msg.id);
                        setMessages(prevMessages =>
                            prevMessages.map(m => m.id === msg.id ? { ...m, delivered: true } : m)
                        );
                    } catch (err) {
                        console.error(`Error marcando mensaje ${msg.id} como entregado:`, err);
                    }
                }

                // Marcar como 'seen' (visto): el mensaje apareció en la pantalla del receptor.
                if (!msg.seen) {
                    try {
                        await markMessageAsSeen(msg.id);
                        setMessages(prevMessages =>
                            prevMessages.map(m => m.id === msg.id ? { ...m, seen: true } : m)
                        );
                    } catch (err) {
                        console.error(`Error marcando mensaje ${msg.id} como visto:`, err);
                    }
                }

                // Marcar como 'read' (leído): el mensaje fue activamente consumido por el receptor.
                // Podrías decidir que 'seen' implica 'read', o que 'read' es un evento posterior (ej., después de X segundos).
                // Aquí, lo marcamos junto con 'seen' para simplificar si tu app no tiene una distinción visual fuerte.
                if (!msg.read) {
                    try {
                        await markMessageAsRead(msg.id);
                        setMessages(prevMessages =>
                            prevMessages.map(m => m.id === msg.id ? { ...m, read: true } : m)
                        );
                    } catch (err) {
                        console.error(`Error marcando mensaje ${msg.id} como leído:`, err);
                    }
                }
            }
        });

      } else {
          console.error("La API no devolvió un array para los mensajes:", data);
          setError("Formato de datos de mensajes inesperado.");
          setMessages([]);
      }
    } catch (err) {
      setError("No se pudieron cargar los mensajes.");
      console.error("Error completo de getConversationMessages:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversation, currentUserId]); // Dependencia de 'conversation' y 'currentUserId'

  useEffect(() => {
    // Scroll al final de los mensajes cada vez que se actualizan
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    // Asegurarse de que hay contenido y una conversación seleccionada
    if (!newMessageContent.trim() || !conversation || !conversation.id) return;

    try {
      const sentMessage = await sendMessage(conversation.id, newMessageContent);
      // Añadir el mensaje enviado a la lista, ya que el backend lo devuelve completo
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessageContent(""); // Limpiar el input
    } catch (err) {
      console.error("Error al enviar mensaje:", err.response?.data || err.message);
      alert("Error al enviar mensaje: " + (err.response?.data?.detail || err.message));
    }
  };

  if (!conversation) {
    return <div className="chat-placeholder">Selecciona una conversación para comenzar a chatear.</div>;
  }
  if (loading) return <div className="chat-loading">Cargando mensajes...</div>;
  if (error) return <div className="chat-error">{error}</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat con {conversation.other_user ? conversation.other_user.username : 'Cargando...'}</h2>
      </div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="no-messages">Aún no hay mensajes en esta conversación.</p>
        )}
        {messages.length > 0 && (
          messages.map((msg) => (
            <div
              key={msg.id} // Usa el ID del mensaje
              className={`message-bubble ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}
            >
              <p>{msg.content}</p>
              <small className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
                {/* --- Mostrar los ticks de estado para los mensajes ENVIADOS por el usuario actual --- */}
                {msg.sender_id === currentUserId && (
                  <span className="message-status-icons">
                    {/* Un tick para Delivered (entregado al dispositivo del receptor) */}
                    <span className={`status-icon ${msg.delivered ? 'delivered' : ''}`}>✓</span>
                    {/* Doble tick para Seen (visto por el receptor en la pantalla) */}
                    <span className={`status-icon ${msg.seen ? 'seen' : ''}`}>✓</span>
                    {/* Tercer tick o doble azul para Read (leído activamente por el receptor) */}
                    <span className={`status-icon ${msg.read ? 'read' : ''}`}>✓</span>
                    {/* NOTA: Para los ticks azules, deberías aplicar un CSS específico para .read.
                        Ejemplo: .message-status-icons .read { color: blue; } */}
                  </span>
                )}
              </small>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessageContent}
          onChange={(e) => setNewMessageContent(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="chat-input"
          required
        />
        <button type="submit" className="chat-send-button">Enviar</button>
      </form>
    </div>
  );
};

export default Chat;