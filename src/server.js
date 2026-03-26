require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN,
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join:user', (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });
});

server.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});