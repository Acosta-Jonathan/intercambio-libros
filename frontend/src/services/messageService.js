// src/services/messageService.js
import api from './api'; // Importa tu instancia configurada de Axios

// Función para obtener los usuarios con los que el usuario actual ha conversado (tus "conversaciones")
export const getChatUsers = async () => {
  try {
    // Este endpoint debería devolver una lista de usuarios con los que hay chats
    const response = await api.get('/messages/users/'); // Este es tu endpoint actual según tu código
    return response.data; // Debería devolver una lista de objetos de usuario
  } catch (error) {
    console.error('Error fetching chat users:', error);
    throw error;
  }
};

// Función para obtener los mensajes entre el usuario actual y un usuario destino
export const getMessagesBetweenUsers = async (userId) => {
  try {
    // Este endpoint debería devolver los mensajes entre el usuario autenticado y userId
    const response = await api.get(`/messages/${userId}`); // Este es tu endpoint actual según tu código
    return response.data; // Debería devolver una lista de objetos de mensaje
  } catch (error) {
    console.error(`Error fetching messages with user ${userId}:`, error);
    throw error;
  }
};

// Función para enviar un nuevo mensaje
export const sendMessageToUser = async (receiverId, content) => {
  try {
    // Este endpoint debería enviar un mensaje al receiverId
    const response = await api.post("/messages/", {
      receptor_id: receiverId,
      contenido: content, // Tu nombre de campo actual en el backend
    });
    return response.data; // Debería devolver el objeto del mensaje enviado
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};