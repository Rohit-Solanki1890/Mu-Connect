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
const messagesRoutes = require('./routes/messages');
const roomRoutes = require('./routes/rooms');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const adminFeaturesRoutes = require('./routes/adminFeatures');
const seedData = require('./utils/seedData');

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ MongoDB connected");
    // Seed data on startup
    await seedData();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));


const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cookieParser());

// ✅ CORS setup
const allowedOrigins = [
  'http://localhost:5173',  // Local dev frontend
  'http://localhost:3000',  // Local dev frontend
  'https://closenet-eight.vercel.app',  // Production frontend
  'https://muconnect-eight.vercel.app',  // Old frontend (transition)
  'https://mu-connect-frontend.onrender.com',  // Old frontend (transition)
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
app.use('/api/messages', messagesRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminFeaturesRoutes);

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
