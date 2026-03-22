import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bot, SendHorizonal, CornerDownLeft, Loader2 } from 'lucide-react';
import { addMessage, setAiTyping } from '../features/chat/chatSlice';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_AI_BUDDY_URL || 'http://localhost:3005'; // 

const EasyBuyAI = () => {
    const dispatch = useDispatch();
    const { messages, isAiTyping } = useSelector(state => state.aiChat);
    const [userInput, setUserInput] = useState('');
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

  useEffect(() => {
    // 1. Connection Options: Polling ko disable kar do, seedha websocket use karo
    const connectionOptions = {
        withCredentials: true,
        transports: ['websocket'], // Ye sabse important hai warning hatane ke liye
        reconnection: true,
        reconnectionAttempts: 3,
        timeout: 5000,
    };

    // 2. Initialize only if not exists
    if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, connectionOptions);
    }

    const socket = socketRef.current;

    // 3. Status Check (Debug ke liye)
    socket.on('connect', () => console.log("✅ AI Socket Connected:", socket.id));
    socket.on('connect_error', (err) => console.log("❌ Connection Error:", err.message));

    socket.on('message', (data) => {
        dispatch(setAiTyping(false));
        dispatch(addMessage({ sender: 'ai', text: data }));
    });

    socket.on('error', (err) => {
        dispatch(setAiTyping(false));
        toast.error(err.message || "AI Error");
    });

    // 4. CLEANUP: Sirf listeners hatao, disconnect mat karo reload par agar error aa raha hai
    return () => {
        if (socket) {
            socket.off('message');
            socket.off('error');
            socket.off('connect');
            socket.off('connect_error');
            // socket.disconnect(); // Ise comment out karke dekho agar reload error persist kare
        }
    };
}, [dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!userInput.trim()) return;

        dispatch(addMessage({ sender: 'user', text: userInput }));
        dispatch(setAiTyping(true));

        // Backend event name 'message' hai
        socketRef.current.emit('message', userInput);
        setUserInput('');
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 h-full">

                    {/* LEFT PANEL: Responsive hidden on small screens if needed */}
                    <div className="hidden lg:block lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center shadow-xl shadow-gray-200/20">
                            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100 mb-6">
                                <Bot size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">EasyBuy AI</h2>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">Personal Shopping Agent</p>
                            <p className="text-gray-500 text-sm mt-6 leading-relaxed">
                                I can find products, track orders, and even add items to your cart. Just ask!
                            </p>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Main Chat */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[2.5rem] lg:rounded-[3.5rem] shadow-2xl shadow-gray-200/40 border border-gray-50 h-[80vh] flex flex-col overflow-hidden relative">

                            {/* Messages Container */}
                            <div className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 scroll-smooth no-scrollbar">
                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                        <Bot size={60} className="mb-4 opacity-20" />
                                        <p className="text-xs font-black uppercase tracking-widest">How can I help you today?</p>
                                    </div>
                                )}
                                {messages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] md:max-w-[70%] p-5 md:p-7 rounded-[2rem] ${msg.sender === 'user'
                                                ? 'bg-gray-900 text-white rounded-tr-none shadow-xl'
                                                : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                                            }`}>
                                            <p className="text-sm md:text-base font-bold leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}

                                {isAiTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-blue-50 text-blue-600 p-5 rounded-[2rem] rounded-tl-none border border-blue-100 flex items-center gap-3 animate-pulse">
                                            <Loader2 size={18} className="animate-spin" />
                                            <span className="text-xs font-black uppercase tracking-widest">EasyBuyAI is thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-6 md:p-8 border-t border-gray-50">
                                <div className="max-w-4xl mx-auto flex items-center gap-4 relative">
                                    <input
                                        type="text"
                                        placeholder="Ask me anything..."
                                        className="w-full pl-6 pr-20 py-5 bg-gray-50 border-none rounded-2xl md:rounded-3xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button
                                        onClick={handleSend}
                                        className="absolute right-2 md:right-3 bg-gray-900 text-white p-4 rounded-xl md:rounded-2xl hover:bg-blue-600 transition-all active:scale-90"
                                    >
                                        <SendHorizonal size={20} />
                                    </button>
                                </div>
                                <p className="text-center text-[9px] text-gray-300 font-black uppercase tracking-widest mt-4">AI may provide incorrect info. Verify important details.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EasyBuyAI;