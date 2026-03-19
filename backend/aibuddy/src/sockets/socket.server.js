const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const agent = require('../agent/agent');

async function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        // path: '/api/socket/socket.io/'
        cors: {
            origin: "http://localhost:5173", // frontend ka URL
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket'] // WebSocket ko force karna, polling avoid karne ke liye
    });

    // Middleware: Auth check
    io.use((socket, next) => {
        try {
            const cookies = socket.handshake.headers?.cookie;
            const { token } = cookies ? cookie.parse(cookies) : {};

            if (!token) return next(new Error("Authentication error: No token"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            socket.token = token;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.id || 'anonymous'}`);

        socket.on('message', async (data) => {
            try {
                console.log("Received message:", data);

                // 1. Agent call ko try-catch mein wrap karna zaroori hai
                const agentResponse = await agent.invoke({
                    messages: [
                        {
                            role: "user",
                            content: data
                        }
                    ]
                }, {
                    configurable: { thread_id: socket.id }, // Memory handle karne ke liye (Future use)
                    metadata: {
                        token: socket.token
                    }
                });

                console.log("Agent responded successfully");

                const lastMessage = agentResponse.messages[agentResponse.messages.length - 1];

                // 2. Fallback agar content empty ho (tools call ke baad kabhi kabhi hota hai)
                const finalContent = lastMessage.content || "I've processed your request.";

                socket.emit('message', finalContent);

            } catch (error) {
                // 3. Error Handling: Agar quota hit ho ya network issue ho
                console.error("Agent Invoke Error:", error.message);

                let userFriendlyError = "Sorry, I'm a bit overwhelmed. Please try again in a minute.";

                if (error.status === 429) {
                    userFriendlyError = "Daily limit reached or too many requests. Please wait a bit.";
                }

                socket.emit('error', { message: userFriendlyError });
            }
        });

        socket.on('disconnect', () => {
            console.log("User disconnected");
        });
    });
}

module.exports = { initSocketServer };