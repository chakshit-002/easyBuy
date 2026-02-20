require('dotenv').config();
const app = require('./src/app')
const http = require('http');


const {initSocketServer} = require('./src/sockets/socket.server')
const httpServer = http.createServer(app);




initSocketServer(httpServer);

// app.listen(3005,()=>{
//     console.log("AI buddy is running  on 3005 port no.")
// })

httpServer.listen(3005,()=>{
    console.log("AI buddy is running  on 3005 port no.")
})