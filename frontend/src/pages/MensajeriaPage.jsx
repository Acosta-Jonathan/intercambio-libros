import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/MensajeriaPage.css";

const API_BASE = "http://localhost:8000";

const MensajeriaPage = () => {
  const location = useLocation();
  const { targetUserId } = location.state || {};
  const loggedInUser = useSelector((state) => state.auth.user);
  const loggedInUserId = loggedInUser?.id || null;

  const [chats, setChats] = useState([]); // {user_id, username, last_message, last_timestamp}
  const [selectedChatUser, setSelectedChatUser] = useState(null); // {user_id, username}
  const [messages, setMessages] = useState([]); // historial con selectedChatUser
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  const token = localStorage.getItem("token");

  // Abrir WebSocket
  useEffect(() => {
    if (!token) return;

    const wsUrl = `ws://localhost:8000/messages/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // console.log("WS conectado");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // data => {id, sender_id, receiver_id, content, timestamp, is_read}
      const otherId = data.sender_id === loggedInUserId ? data.receiver_id : data.sender_id;

      // Si estoy en esa conversación, agrego el mensaje
      if (selectedChatUser && selectedChatUser.user_id === otherId) {
        setMessages((prev) => [...prev, data]);
      }

      // Actualizo la lista de chats (muevo/creo entrada con last_message)
      setChats((prev) => {
        const rest = prev.filter((c) => c.user_id !== otherId);
        const existing = prev.find((c) => c.user_id === otherId);
        const username = existing?.username ?? `Usuario ${otherId}`;
        const updated = {
          user_id: otherId,
          username,
          last_message: data.content,
          last_timestamp: data.timestamp,
        };
        return [updated, ...rest];
      });
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };
  }, [token, loggedInUserId, selectedChatUser]);

  // Cargar lista de conversaciones
  useEffect(() => {
    if (!token) return;
    const loadPartners = async () => {
      setLoadingChats(true);
      try {
        const res = await fetch(`${API_BASE}/messages/partners`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setChats(data);

        // Si vengo desde "Iniciar conversación" del modal
        if (targetUserId) {
          const existing = data.find((c) => c.user_id === targetUserId);
          if (existing) {
            setSelectedChatUser({ user_id: existing.user_id, username: existing.username });
          } else {
            // Aún no hay historial, creo entrada "temporal"
            setSelectedChatUser({ user_id: targetUserId, username: `Usuario ${targetUserId}` });
            setChats((prev) => [
              { user_id: targetUserId, username: `Usuario ${targetUserId}`, last_message: "¡Inicia una nueva conversación!", last_timestamp: new Date().toISOString() },
              ...prev,
            ]);
          }
        }
      } catch (e) {
        console.error("Error cargando conversaciones:", e);
      } finally {
        setLoadingChats(false);
      }
    };
    loadPartners();
  }, [token, targetUserId]);

  // Cargar historial de una conversación
  useEffect(() => {
    if (!token || !selectedChatUser) {
      setMessages([]);
      return;
    }
    const loadHistory = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`${API_BASE}/messages/conversation/${selectedChatUser.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data);
      } catch (e) {
        console.error("Error cargando historial:", e);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadHistory();
  }, [token, selectedChatUser]);

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatUser || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const payload = {
      receiver_id: selectedChatUser.user_id,
      content: newMessage.trim(),
    };
    wsRef.current.send(JSON.stringify(payload));
    // Como el backend reenvía al receptor, y nosotros somos emisor,
    // agregamos localmente para feedback inmediato:
    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        sender_id: loggedInUserId,
        receiver_id: selectedChatUser.user_id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        is_read: false,
      },
    ]);
    setChats((prev) => {
      const rest = prev.filter((c) => c.user_id !== selectedChatUser.user_id);
      const updated = {
        user_id: selectedChatUser.user_id,
        username: selectedChatUser.username,
        last_message: newMessage.trim(),
        last_timestamp: new Date().toISOString(),
      };
      return [updated, ...rest];
    });
    setNewMessage("");
  };

  const getChatPartnerName = (chat) => chat.username || `Usuario ${chat.user_id}`;

  return (
    <div className="messaging-page-container">
      <div className="chat-list-pane">
        <h2>Chats</h2>
        {loadingChats ? (
          <p>Cargando chats...</p>
        ) : (
          <div className="chat-list">
            {chats.length === 0 ? (
              <p>No tienes conversaciones activas.</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.user_id}
                  className={`chat-item ${selectedChatUser?.user_id === chat.user_id ? "active" : ""}`}
                  onClick={() => setSelectedChatUser({ user_id: chat.user_id, username: chat.username })}
                >
                  <div className="chat-info">
                    <p className="chat-partner-name">{getChatPartnerName(chat)}</p>
                    <p className="last-message">{chat.last_message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="chat-window-pane">
        {selectedChatUser ? (
          <>
            <div className="chat-header">
              <h3>{selectedChatUser.username || `Usuario ${selectedChatUser.user_id}`}</h3>
            </div>

            <div className="messages-container">
              {loadingMessages ? (
                <p>Cargando mensajes...</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-bubble ${msg.sender_id === loggedInUserId ? "sent" : "received"}`}
                  >
                    <p>{msg.content}</p>
                  </div>
                ))
              )}
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
              <button type="submit" className="send-button">Enviar</button>
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
