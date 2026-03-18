import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        messages: [], // Har message object: { sender: 'user'|'ai', text: string }
        isAiTyping: false, // Loading indicator ke liye
    },
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setAiTyping: (state, action) => {
            state.isAiTyping = action.payload;
        },
        // Optional: Chat history clear karne ke liye
        clearChat: (state) => {
            state.messages = [];
        }
    }
});

export const { addMessage, setAiTyping, clearChat } = chatSlice.actions;
export default chatSlice.reducer;