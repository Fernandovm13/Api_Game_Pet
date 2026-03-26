require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const petRoutes = require('./routes/pet.routes');
const deviceRoutes = require('./routes/device.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN,
    credentials: true
  })
);

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'API funcionando' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/pets', petRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

module.exports = app;