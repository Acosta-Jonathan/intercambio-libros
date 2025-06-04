// src/components/mensajes/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  getConversationMessages,
  sendMessage,
  markMessageAsSeen,
  markMessageAsRead,
  markMessageAsDelivered
} from '../../services/messageService';
import { useSelector } from 'react-redux';
import '../../styles/Chat.css';

const Chat = ({ conversation, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null); // Ref para el div vacío al final
  const chatMessagesContainerRef = useRef(null); // Ref para el contenedor real de mensajes

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

        data.forEach(async (msg) => {
          if (msg.receiver_id === currentUserId) {
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
  }, [conversation, currentUserId]);

  // Lógica de scroll mejorada
  useEffect(() => {
    if (chatMessagesContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = chatMessagesContainerRef.current;

      // Determina si el usuario estaba al final del scroll (o muy cerca)
      // Un umbral de 100 píxeles es común para dar un poco de margen.
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

      // Solo desplaza si el usuario estaba en la parte inferior
      // o si la lista de mensajes es muy corta (menos de 20 mensajes, por ejemplo, para una conversación nueva)
      // La condición de 'messages.length < 20' es opcional y se puede ajustar o quitar.
      if (isAtBottom || messages.length < 40) { // <-- Se puede ajustar el umbral o quitar la segunda parte
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]); // Se ejecuta cuando los mensajes cambian

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageContent.trim() || !conversation || !conversation.id) return;

    try {
      const sentMessage = await sendMessage(conversation.id, newMessageContent);
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessageContent("");
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
        <h2>{conversation.other_user ? conversation.other_user.username : 'Cargando...'}</h2>
      </div>
      {/* Asigna la ref `chatMessagesContainerRef` aquí */}
      <div className="chat-messages" ref={chatMessagesContainerRef}>
        {messages.length === 0 && (
          <p className="no-messages">Aún no hay mensajes en esta conversación.</p>
        )}
        {messages.length > 0 && (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}
            >
              <p>{msg.content}</p>
              <div className="message-timestamp">
                <span>{new Date(msg.timestamp + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false})}</span>
                {msg.sender_id === currentUser.id && (
                  <span className="message-status-icons">
                    <span className={`status-icon ${msg.delivered ? 'delivered' : ''}`}>✓</span>
                    <span className={`status-icon ${msg.read ? 'read' : ''}`}>✓</span>
                  </span>
                )}
              </div>
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