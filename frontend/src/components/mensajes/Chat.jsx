import React, { useState, useEffect, useRef } from "react";
import {
  getConversationMessages,
  sendMessage,
  markMessageAsSeen,
  markMessageAsRead,
  markMessageAsDelivered
} from '../../services/messageService';
import { useSelector } from 'react-redux';
import { getSocket } from '../../services/socket';
import '../../styles/Chat.css';

const Chat = ({ conversation, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const chatMessagesContainerRef = useRef(null);

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
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, delivered: true } : m));
              } catch (err) { console.error(`Error entregado:`, err); }
            }
            if (!msg.seen) {
              try {
                await markMessageAsSeen(msg.id);
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, seen: true } : m));
              } catch (err) { console.error(`Error visto:`, err); }
            }
            if (!msg.read) {
              try {
                await markMessageAsRead(msg.id);
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
              } catch (err) { console.error(`Error leído:`, err); }
            }
          }
        });

      } else {
        console.error("Formato inesperado:", data);
        setError("Formato inesperado.");
        setMessages([]);
      }
    } catch (err) {
      setError("No se pudieron cargar los mensajes.");
      console.error("Error al cargar mensajes:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversation, currentUserId]);

  useEffect(() => {
    if (chatMessagesContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = chatMessagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      if (isAtBottom || messages.length < 40) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageContent.trim() || !conversation?.id) return;

    try {
      const sentMessage = await sendMessage(conversation.id, newMessageContent);
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessageContent("");
    } catch (err) {
      console.error("Error al enviar:", err.response?.data || err.message);
      alert("Error al enviar: " + (err.response?.data?.detail || err.message));
    }
  };

  // 🔌 Escuchar mensajes en tiempo real desde Socket.IO
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (incomingMessage) => {
      if (incomingMessage.conversation_id === conversation?.id) {
        setMessages((prev) => [...prev, incomingMessage]);

        if (incomingMessage.receiver_id === currentUser.id) {
          markMessageAsSeen(incomingMessage.id).catch(err =>
            console.error('Error marcando como visto (socket):', err)
          );
        }
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [conversation?.id, currentUser.id]);

  if (!conversation) return <div className="chat-placeholder">Selecciona una conversación para comenzar a chatear.</div>;
  if (loading) return <div className="chat-loading">Cargando mensajes...</div>;
  if (error) return <div className="chat-error">{error}</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{conversation.other_user?.username || 'Cargando...'}</h2>
      </div>
      <div className="chat-messages" ref={chatMessagesContainerRef}>
        {messages.length === 0 && <p className="no-messages">Aún no hay mensajes.</p>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}
          >
            <p>{msg.content}</p>
            <div className="message-timestamp">
              <span>{new Date(msg.timestamp + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              {msg.sender_id === currentUser.id && (
                <span className="message-status-icons">
                  <span className={`status-icon ${msg.delivered ? 'delivered' : ''}`}>✓</span>
                  <span className={`status-icon ${msg.read ? 'read' : ''}`}>✓</span>
                </span>
              )}
            </div>
          </div>
        ))}
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
