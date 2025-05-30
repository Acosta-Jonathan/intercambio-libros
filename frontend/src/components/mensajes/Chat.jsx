// src/components/mensajes/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { getMessagesBetweenUsers, sendMessageToUser } from '../../services/messageService';
import { useSelector } from 'react-redux'; // Para obtener el ID del usuario actual
import '../../styles/Chat.css';

const Chat = ({ usuarioDestino }) => {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Asumiendo que tu estado de Redux en auth.user tiene el id del usuario logueado
  const currentUserId = useSelector((state) => state.auth.user?.id);

  const cargarMensajes = async () => {
    if (!usuarioDestino) {
      setMessages([]); // Limpiar mensajes si no hay usuario destino
      setLoading(false);
      setError(null); // Borrar cualquier error anterior
      return;
    }
    setLoading(true);
    setError(null); // Limpiar errores previos
    try {
      const data = await getMessagesBetweenUsers(usuarioDestino.id);
      if (Array.isArray(data)) {
          setMensajes(data);
      } else {
          console.error("La API no devolvió un array para los mensajes:", data);
          setError("Formato de datos de mensajes inesperado.");
          setMensajes([]); // Asegurarse de que sea un array vacío
      }
    
      } catch (err) {
        setError("No se pudieron cargar los mensajes.");
        console.error("Error completo de getMessagesBetweenUsers:", err);
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carga mensajes cuando cambia el usuario destino
    cargarMensajes();
  }, [usuarioDestino]); // Dependencia del usuarioDestino

  useEffect(() => {
    // Auto-scroll al final de los mensajes cada vez que se actualizan
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]); // Dependencia de los mensajes

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !usuarioDestino || !usuarioDestino.id) return; // Validación básica

    try {
      const sentMessage = await sendMessageToUser(usuarioDestino.id, nuevoMensaje);
      // Asumiendo que el backend devuelve el mensaje enviado, lo añadimos directamente
      setMensajes((prevMensajes) => [...prevMensajes, sentMessage]);
      setNuevoMensaje(""); // Limpiar el input
      // La recarga completa no es necesaria si el backend devuelve el mensaje
      // Si la carga de mensajes no es en tiempo real, puedes mantener cargarMensajes() aquí
      // Pero para simular mejor el tiempo real, solo añadimos el mensaje.
      // Si el backend no devuelve el mensaje completo, deberías llamar a cargarMensajes()
      // o construir un objeto de mensaje mock para añadirlo a la lista.
    } catch (err) {
      setError("No se pudo enviar el mensaje.");
      console.error("Error completo de sendMessageToUser:", err); // Registrar el error completo
    }
  };

  if (!usuarioDestino) {
    return <div className="chat-placeholder">Selecciona una conversación para comenzar a chatear.</div>;
  }
  if (loading) return <div className="chat-loading">Cargando mensajes...</div>;
  if (error) return <div className="chat-error">{error}</div>;


  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat con {usuarioDestino.username}</h2>
      </div>
      <div className="chat-messages">
        {mensajes.length === 0 && (
          <p className="no-messages">Aún no hay mensajes en esta conversación.</p>
        )}
        {mensajes.length > 0 && (
          mensajes.map((msg) => (
            // Asegúrate de que msg.id, msg.sender_id, msg.contenido, msg.timestamp existan
            <div
              key={msg.id || `msg-${msg.timestamp}`} // Clave de respaldo
              className={`message-bubble ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}
            >
              <p><strong>{msg.emisor_nombre || msg.sender_username || 'Desconocido'}:</strong> {msg.contenido}</p>
              <small className="message-timestamp">{new Date(msg.timestamp || msg.created_at).toLocaleTimeString()}</small>
            </div>
          ))
        )}
        <div ref={messagesEndRef} /> {/* Elemento para el auto-scroll */}
      </div>
      <form onSubmit={enviarMensaje} className="chat-input-form">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNewMensaje(e.target.value)}
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