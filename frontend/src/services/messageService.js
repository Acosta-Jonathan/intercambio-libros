// src/services/messageService.js
import api from './api'; // Tu instancia configurada de Axios que maneja el token

// --- Conversaciones ---
// Endpoint: GET /conversations/
// Devuelve una lista de objetos Conversation
export const getUserConversations = async () => {
  try {
    const response = await api.get('/conversations/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user conversations:', error.response?.data || error.message);
    throw error;
  }
};

// --- Mensajes ---
// Endpoint: GET /conversations/{conversation_id}/messages/
// Devuelve una lista de objetos Message para una conversación específica
export const getConversationMessages = async (conversationId, skip = 0, limit = 100) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages/?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Endpoint: POST /messages/
// Envía un nuevo mensaje a una conversación
export const sendMessage = async (conversationId, content) => {
  try {
    const response = await api.post("/messages/", {
      conversation_id: conversationId,
      content: content,
    });
    return response.data; // Debería devolver el objeto del mensaje enviado (con id, timestamps, etc.)
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error;
  }
};

// --- Endpoints de estado de mensajes (PUT) ---
// Endpoint: PUT /messages/{message_id}/delivered/
export const markMessageAsDelivered = async (messageId) => {
  try {
    const response = await api.put(`/messages/${messageId}/delivered/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking message ${messageId} as delivered:`, error.response?.data || error.message);
    throw error;
  }
};

// Endpoint: PUT /messages/{message_id}/seen/
export const markMessageAsSeen = async (messageId) => {
  try {
    const response = await api.put(`/messages/${messageId}/seen/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking message ${messageId} as seen:`, error.response?.data || error.message);
    throw error;
  }
};

// Endpoint: PUT /messages/{message_id}/read/
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await api.put(`/messages/${messageId}/read/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking message ${messageId} as read:`, error.response?.data || error.message);
    throw error;
  }
};