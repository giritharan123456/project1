require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { testConnection } = require('./src/config/db');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { attachRealtimeServer } = require('./src/websocket/rtmServer');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const meetingRoutes = require('./src/routes/meetingRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const recordingRoutes = require('./src/routes/recordingRoutes');
const messageRoutes = require('./src/routes/messageRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limit as a baseline; tighter limits are applied to auth routes specifically
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/messages', messageRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
attachRealtimeServer(server);

const PORT = process.env.PORT || 5000;

testConnection().then(() => {
  server.listen(PORT, () => {
    console.log(`Connectly backend running on http://localhost:${PORT}`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
  });
});
