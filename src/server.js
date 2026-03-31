const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
require('dotenv').config();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
  console.log('User Connected (AuraFit Pro):', socket.id);

  socket.on('join_duel', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined duel room: ${room}`);
  });

  socket.on('rep_completed', (data) => {
    socket.to(data.room).emit('friend_rep', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`--- AURAFIT PRO BACKEND ---`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
