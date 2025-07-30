import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  messages: {}, // { [conversationId]: [msg1, msg2, ...] }
  activeConversation: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations(state, action) {
      state.conversations = action.payload;
    },
    setActiveConversation(state, action) {
      state.activeConversation = action.payload;
    },
    setMessagesForConversation(state, action) {
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    },
    addMessage(state, action) {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);

      // Actualiza last message en la conversación si corresponde
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv) {
        conv.last_message_content = message.content;
        conv.last_message_timestamp = message.timestamp;
      }
    },
    clearChatState(state) {
      return initialState;
    }
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessagesForConversation,
  addMessage,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
