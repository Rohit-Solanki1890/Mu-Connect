const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const blogRoutes = require('./routes/blogs');
const roomRoutes = require('./routes/rooms');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

// Import socket handlers
const socketHandler = require('./socket/socketHandler');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = createServer(app);

// Build allowed origins list from env (can be comma-separated). Strip trailing slashes.
const rawClientUrls = process.env.CLIENT_URL || process.env.CLIENT_URLS || '';
const allowedOrigins = rawClientUrls
  .split(',')
  .map(u => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      const originNoSlash = origin.replace(/\/$/, '');
      if (allowedOrigins.length === 0) {
        // If no allowed origins specified, allow any origin (useful for development)
        return callback(null, true);
      }
      if (allowedOrigins.includes(originNoSlash)) return callback(null, true);
      return callback(new Error('CORS origin not allowed'));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(limiter);

// CORS middleware: allow multiple origins and echo the Origin header when allowed
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like server-to-server or mobile)
    if (!origin) return callback(null, true);
    const originNoSlash = origin.replace(/\/$/, '');
    if (allowedOrigins.length === 0) {
      // no specific origins set -> allow any
      return callback(null, true);
    }
    if (allowedOrigins.includes(originNoSlash)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Marwadi Connect Pro API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io connection handling
socketHandler(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Seed data on first run
  const seedData = require('./utils/seedData');
  seedData();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io server ready`);
});


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

module.exports = { app, io };
