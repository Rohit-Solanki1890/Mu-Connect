const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const blogRoutes = require('./routes/blogs');
const roomRoutes = require('./routes/rooms');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cookieParser());

// ✅ CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://muconnect-eight.vercel.app',
  'https://mu-connect-frontend.onrender.com',
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// --- DEFAULT ROUTE ---
app.get('/', (req, res) => {
  res.send('MU Connect Backend is running 🚀');
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- SERVER + SOCKET.IO ---
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log('✅ Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
