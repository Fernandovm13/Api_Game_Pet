const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

const authRoutes = require('./routes/auth.routes');
const workoutRoutes = require('./routes/workout.routes');
const notificationRoutes = require('./routes/notification.routes');
const friendRoutes = require('./routes/friend.routes');
const rankingRoutes = require('./routes/ranking.routes');

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/friends', friendRoutes);
app.use('/api/v1/ranking', rankingRoutes);

app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'AuraFit Pro API is Online' });
});


module.exports = app;
