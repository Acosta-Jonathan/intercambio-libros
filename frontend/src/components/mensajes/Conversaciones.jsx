// src/components/mensajes/Conversaciones.jsx
import React, { useEffect, useState } from "react";
import { getChatUsers } from '../../services/messageService';
import '../../styles/Conversaciones.css';

const Conversaciones = ({ onSelectUser }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null); 

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await getChatUsers();
        if (Array.isArray(data)) {
            setUsuarios(data);
        } else {
            console.error("La API no devolvió un array para los usuarios:", data);
            setError("Formato de datos de usuarios inesperado.");
            setUsuarios([]); // Asegurarse de que sea un array vacío
        }
      } catch (err) {
        setError("Error al obtener las conversaciones.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []); // El array vacío asegura que se ejecuta solo una vez

  const handleUserClick = (user) => {
    setSelectedUserId(user.id);
    onSelectUser(user);
  };

  // Lógica de renderización - Esto siempre debería devolver *algo*
  return (
    <div className="conversations-list">
      {loading && <div className="conversations-loading">Cargando conversaciones...</div>}
      {error && <div className="conversations-error">{error}</div>}

      {!loading && !error && usuarios.length === 0 && (
        <p className="no-conversations">No tienes conversaciones.</p>
      )}

      {!loading && !error && usuarios.length > 0 && (
        usuarios.map((user) => (
          // Asegúrate de que user.id y user.username estén siempre disponibles o maneja los nulos de forma segura
          <div
            key={user.id || `user-${user.email}`} // Clave de respaldo si falta el id
            className={`conversation-item ${selectedUserId === user.id ? 'active' : ''}`}
            onClick={() => handleUserClick(user)}
          >
            <p className="conversation-user">{user.username || user.email || 'Usuario Desconocido'}</p>
            {/* Agrega más información aquí si tu API la proporciona, p. ej., fragmento del último mensaje */}
          </div>
        ))
      )}
    </div>
  );
};

export default Conversaciones;