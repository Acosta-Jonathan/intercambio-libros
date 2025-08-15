import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getConversations, getMessages, startConversation } from "../services/api";
import "../styles/MensajeriaPage.css";

const MensajeriaPage = () => {
  const { id } = useParams(); // ID del otro usuario de la URL
  const navigate = useNavigate();
  const location = useLocation();
  const { targetUserId, targetUsername } = location.state || {}; // Información del usuario de destino si viene del `state`

  const loggedInUser = useSelector((state) => state.auth.user);
  const loggedInUserId = loggedInUser?.id || null;
  const token = localStorage.getItem("access_token");

  const [conversations, setConversations] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Función para conectar al WebSocket
  const connectWebSocket = useCallback(() => {
    if (!token || !loggedInUserId || wsRef.current) return;

    wsRef.current = new WebSocket(`ws://localhost:8000/messages/ws?token=${token}`);

    wsRef.current.onopen = () => {
      console.log("Conectado al WebSocket");
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const otherId = message.sender_id === loggedInUserId ? message.receiver_id : message.sender_id;

      // Actualiza la lista de conversaciones con el nuevo mensaje
      setConversations(prev => {
        const rest = prev.filter(c => c.other_user_id !== otherId);
        const existing = prev.find(c => c.other_user_id === otherId);
        const username = existing?.other_user_name ?? `Usuario ${otherId}`;
        const updated = {
          other_user_id: otherId,
          other_user_name: username,
          last_message: message.content,
          last_message_time: message.timestamp,
        };
        return [updated, ...rest];
      });

      // Si el mensaje es para el chat activo, agrégalo a la vista
      if (selectedChatUser && selectedChatUser.user_id === otherId) {
        setMessages(prev => [...prev, message]);
      }
    };

    wsRef.current.onclose = () => {
        console.log("Desconectado del WebSocket", event.code);
        wsRef.current = null;
        // Lógica de reconexión: intenta reconectar después de un breve retraso
        setTimeout(() => {
            console.log("Intentando reconectar...");
            connectWebSocket();
        }, 3000); // Intenta reconectar después de 3 segundos
    };

    wsRef.current.onerror = (error) => {
      console.error("Error en WebSocket:", error);
    };

    // Función de limpieza para cerrar la conexión al desmontar el componente
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [token, loggedInUserId, selectedChatUser]);

  // Carga inicial de conversaciones y conexión WebSocket
  useEffect(() => {
    const loadConversations = async () => {
      if (!token) return;
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (error) {
        console.error("Error al cargar conversaciones:", error);
      }
    };

    loadConversations();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [token, connectWebSocket]);

  // Manejar la selección del chat desde la URL o el estado
  useEffect(() => {
    if (id && conversations.length > 0) {
      const chat = conversations.find(c => c.other_user_id === parseInt(id));
      if (chat) {
        setSelectedChatUser({
          user_id: chat.other_user_id,
          username: chat.other_user_name,
        });
      }
    } else if (targetUserId) {
      setSelectedChatUser({
        user_id: targetUserId,
        username: targetUsername || `Usuario ${targetUserId}`,
      });
      // Limpiar el estado para evitar selecciones accidentales en futuros re-renderizados
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [id, targetUserId, targetUsername, conversations, navigate, location.pathname]);

  // Cargar historial de mensajes del chat seleccionado
  useEffect(() => {
    if (!token || !selectedChatUser) {
      setMessages([]);
      return;
    }
    const loadMessages = async () => {
      try {
        const fetchedMessages = await getMessages(selectedChatUser.user_id, token);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error al cargar mensajes:", error);
      }
    };
    loadMessages();
  }, [token, selectedChatUser]);

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Manejar el envío de mensajes
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !selectedChatUser || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // Envía el mensaje por WebSocket
      wsRef.current.send(JSON.stringify({
        receiver_id: selectedChatUser.user_id,
        content: content,
      }));

      // Agrega el mensaje al estado local inmediatamente
      const tempMessage = {
        id: Date.now(),
        sender_id: loggedInUserId,
        receiver_id: selectedChatUser.user_id,
        content: content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempMessage]);

      // Si la conversación no existe, se crea en el backend.
      // Esta llamada asegura que se cree la conversación si es la primera vez que se envía un mensaje.
      await startConversation(selectedChatUser.user_id, token);

      setNewMessage("");

    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

  const selectChat = (chat) => {
    navigate(`/mensajeria/${chat.other_user_id}`);
  };

  return (
    <div className="messaging-page-container">
      <div className="chat-list-pane">
        <h2>Chats</h2>
        <div className="chat-list">
          {conversations.map((chat) => (
            <div
              key={chat.other_user_id}
              className={`chat-item ${
                selectedChatUser?.user_id === chat.other_user_id ? "active" : ""
              }`}
              onClick={() => selectChat(chat)}
            >
              <div className="chat-info">
                <p className="chat-partner-name">{chat.other_user_name}</p>
                <p className="last-message">{chat.last_message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-window-pane">
        {selectedChatUser ? (
          <>
            <div className="chat-header">
              <h3>{selectedChatUser.username}</h3>
            </div>
            <div className="messages-container">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-bubble ${
                    msg.sender_id === loggedInUserId ? "sent" : "received"
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="message-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="message-input"
              />
              <button type="submit" className="send-button">
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat-state">
            <p>Selecciona un chat o inicia una nueva conversación.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MensajeriaPage;