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
  const wsRef = useRef(null); // Referencia persistente al objeto WebSocket

  // ✨ FUNCIÓN PARA CONECTAR AL WEBSOCKET (se ejecuta una única vez al montar el componente)
  const connectWebSocket = useCallback(() => {
    // Si ya existe una conexión o no hay token/usuario logueado, no intentes conectar
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }
    if (!token || !loggedInUserId) {
      console.warn("No hay token o usuario logueado para conectar el WebSocket.");
      return;
    }

    const ws = new WebSocket(`ws://localhost:8000/messages/ws?token=${token}`);

    ws.onopen = () => {
      console.log("Conectado al WebSocket");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const otherId = message.sender_id === loggedInUserId ? message.receiver_id : message.sender_id;

      // Actualiza la lista de conversaciones
      setConversations(prevConversations => {
        const otherChatExists = prevConversations.some(c => c.other_user_id === otherId);
        let updatedConversations;

        // Si el chat ya existe, actualízalo y muévelo al principio
        if (otherChatExists) {
          updatedConversations = prevConversations.map(c => 
            c.other_user_id === otherId ? { ...c, last_message: message.content, last_message_time: message.timestamp } : c
          );
          // Mueve el chat actualizado al principio para que aparezca como el más reciente
          const chatToMove = updatedConversations.find(c => c.other_user_id === otherId);
          const filtered = updatedConversations.filter(c => c.other_user_id !== otherId);
          updatedConversations = [chatToMove, ...filtered];
        } else {
          // Si es un chat nuevo, añádelo al principio (esto puede ocurrir si recibimos un mensaje de un usuario con el que aún no hemos interactuado)
          updatedConversations = [{
            other_user_id: otherId,
            other_user_name: `Usuario ${otherId}`, // Asume un nombre por defecto si no lo tienes
            last_message: message.content,
            last_message_time: message.timestamp,
          }, ...prevConversations];
        }
        return updatedConversations.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
      });

      // Si el mensaje es para el chat activo, agrégalo a la vista
      if (selectedChatUser && (selectedChatUser.user_id === otherId || message.sender_id === loggedInUserId)) {
        setMessages(prev => [...prev, message]);
      }
    };

    ws.onclose = (event) => {
      console.log("Desconectado del WebSocket. Código:", event.code, "Razón:", event.reason);
      wsRef.current = null; // Limpia la referencia al WS cerrado
      // Implementar una lógica de reconexión controlada aquí si lo deseas,
      // pero asegúrate de que no cause un bucle infinito en caso de error persistente.
      // Por ejemplo, con un retraso exponencial o un límite de reintentos.
      // setTimeout(() => {
      //   console.log("Intentando reconectar...");
      //   connectWebSocket();
      // }, 3000);
    };

    ws.onerror = (error) => {
      console.error("Error en WebSocket:", error);
      if (wsRef.current) {
        wsRef.current.close(); // Cierra explícitamente la conexión en caso de error
      }
    };

    wsRef.current = ws; // Guarda la instancia del WebSocket en la referencia

    // Limpieza: Esta función se ejecuta SÓLO cuando el componente se desmonta.
    // Asegura que la conexión se cierre limpiamente para evitar conexiones fantasma.
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        console.log("WebSocket cerrado al desmontar el componente.");
      }
      wsRef.current = null;
    };
  }, [token, loggedInUserId, selectedChatUser]); // Dependencias para re-ejecutar el efecto si cambian

  // ✨ EFECTO PRINCIPAL: Se encarga de iniciar la conexión WebSocket
  // Se ejecuta solo una vez al montar el componente (gracias al `useCallback` y sus dependencias)
  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  // ✨ Cargar conversaciones al inicio y cuando el token cambie
  useEffect(() => {
    const loadConversations = async () => {
      if (!token) return;
      try {
        const data = await getConversations(token); // Pasa el token a getConversations
        setConversations(data);
      } catch (error) {
        console.error("Error al cargar conversaciones:", error);
      }
    };
    loadConversations();
  }, [token]); // Depende del token

  // ✨ Manejar la selección del chat desde la URL o el estado
  useEffect(() => {
    if (id) {
      const parsedId = parseInt(id);
      const chat = conversations.find(c => c.other_user_id === parsedId);
      if (chat) {
        setSelectedChatUser({
          user_id: chat.other_user_id,
          username: chat.other_user_name,
        });
      } else if (targetUserId && targetUserId === parsedId) {
        // Caso de que lleguemos de una búsqueda y el chat no exista en la lista (primera conversación)
        setSelectedChatUser({
          user_id: targetUserId,
          username: targetUsername || `Usuario ${targetUserId}`,
        });
        navigate(location.pathname, { replace: true, state: {} }); // Limpiar el estado de la URL
      } else {
        // Si el ID de la URL no coincide con ninguna conversación existente,
        // podrías querer cargar los detalles del usuario para mostrarlo en el chat.
        // Por ahora, establece un usuario genérico.
        setSelectedChatUser({
          user_id: parsedId,
          username: `Usuario ${parsedId}`,
        });
      }
    } else if (targetUserId) {
      setSelectedChatUser({
        user_id: targetUserId,
        username: targetUsername || `Usuario ${targetUserId}`,
      });
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      setSelectedChatUser(null);
    }
  }, [id, targetUserId, targetUsername, conversations, navigate, location.pathname]);


  // ✨ Cargar historial de mensajes del chat seleccionado
  const fetchMessages = useCallback(async (userId) => {
    if (!token || !userId) {
      setMessages([]);
      return;
    }
    try {
      const fetchedMessages = await getMessages(userId, token);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
    }
  }, [token]);

  useEffect(() => {
    if (selectedChatUser) {
      fetchMessages(selectedChatUser.user_id);
    }
  }, [selectedChatUser, fetchMessages]);


  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Manejar el envío de mensajes
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !selectedChatUser) {
      return;
    }

    // Verifica que el WebSocket esté abierto antes de enviar
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("No se puede enviar el mensaje: WebSocket no está conectado o listo.");
      return;
    }

    try {
      // 1. Envía el mensaje por WebSocket
      wsRef.current.send(JSON.stringify({
        receiver_id: selectedChatUser.user_id,
        content: content,
      }));

      // 2. Optimista: Agrega el mensaje al estado local inmediatamente para una UX fluida
      const tempMessage = {
        id: `temp-${Date.now()}`, // Usar un ID temporal único
        sender_id: loggedInUserId,
        receiver_id: selectedChatUser.user_id,
        content: content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempMessage]);

      // 3. Actualiza la lista de conversaciones (mueve el chat al principio con el último mensaje)
      setConversations(prev => {
        const rest = prev.filter(c => c.other_user_id !== selectedChatUser.user_id);
        const updated = {
          ...selectedChatUser,
          other_user_id: selectedChatUser.user_id,
          other_user_name: selectedChatUser.username,
          last_message: content,
          last_message_time: tempMessage.timestamp,
        };
        return [updated, ...rest].sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
      });

      // 4. Asegura que la conversación exista en el backend (solo si es la primera vez que se envía un mensaje a ese usuario)
      // Esta llamada es idempotente, no creará duplicados.
      await startConversation(selectedChatUser.user_id, token);

      // 5. Limpia el input del mensaje
      setNewMessage("");

    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      // Opcional: Revertir el mensaje optimista si hay un error real de envío
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
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
              {messages.map((msg, index) => ( // Usar index como fallback key si msg.id no está disponible (ej. mensajes temporales)
                <div
                  key={msg.id || index}
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