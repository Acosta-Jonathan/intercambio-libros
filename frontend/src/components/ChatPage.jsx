import React, { useEffect, useState, useRef } from "react";
import { getConversations, getMessages, iniciarConversacion } from "../services/api"; 
// 🔹 getConversations y getMessages tendrás que crearlos en api.js
// siguiendo el patrón de tus otras funciones

let socket = null;

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const token = localStorage.getItem("access_token");
  const messageEndRef = useRef(null);

  // 📌 Cargar lista de conversaciones al entrar
  useEffect(() => {
    if (token) {
      getConversations(token).then(setConversations).catch(console.error);
    }
  }, [token]);

  // 📌 Conectar WebSocket cuando seleccionas una conversación
  useEffect(() => {
    if (!selectedConversation) return;

    connectToChatSocket();

    getMessages(selectedConversation.otherUserId, token)
      .then(setMessages)
      .catch(console.error);

    return () => {
      if (socket) socket.close();
    };
  }, [selectedConversation]);

  // 📌 Autoscroll al final
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connectToChatSocket = () => {
    socket = new WebSocket(`ws://localhost:8000/messages/ws?token=${token}`);

    socket.onopen = () => console.log("✅ WebSocket conectado");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    socket.onclose = () => console.log("❌ WebSocket cerrado");
  };

  const sendMessageSocket = () => {
    if (!messageInput.trim()) return;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          receiver_id: selectedConversation.otherUserId,
          content: messageInput,
        })
      );
      setMessageInput("");
    }
  };

  const handleStartConversation = async (userId) => {
    try {
      const convo = await iniciarConversacion(userId);
      setSelectedConversation(convo);
      setConversations((prev) => [...prev, convo]);
    } catch (error) {
      console.error("Error iniciando conversación:", error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 📌 Lista de conversaciones */}
      <div style={{ width: "250px", borderRight: "1px solid #ccc" }}>
        <h3>Conversaciones</h3>
        {conversations.map((c) => (
          <div
            key={c.id}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: selectedConversation?.id === c.id ? "#f0f0f0" : "",
            }}
            onClick={() => setSelectedConversation(c)}
          >
            {c.otherUserName}
          </div>
        ))}
      </div>

      {/* 📌 Ventana de chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                textAlign: msg.sender_id === selectedConversation?.currentUserId ? "right" : "left",
              }}
            >
              <p>{msg.content}</p>
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* 📌 Caja de envío */}
        {selectedConversation && (
          <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc" }}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              style={{ flex: 1, marginRight: "10px" }}
            />
            <button onClick={sendMessageSocket}>Enviar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
