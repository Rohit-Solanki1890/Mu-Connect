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

// Optional: allow regex patterns for preview domains via CLIENT_PATTERNS env (comma-separated regex strings)
const rawClientPatterns = process.env.CLIENT_PATTERNS || '';
const allowedPatterns = rawClientPatterns
  .split(',')
  .map(p => p.trim())
  .filter(Boolean)
  .map(p => {
    try {
      return new RegExp(p);
    } catch (err) {
      console.warn('Invalid CLIENT_PATTERNS regex:', p);
      return null;
    }
  })
  .filter(Boolean);

// Debug flag
const DEBUG_CORS = process.env.DEBUG_CORS === 'true';

// utility to check whether an origin is allowed
function originAllowed(origin) {
  if (!origin) {
    if (DEBUG_CORS) console.log('[CORS] no origin provided -> allowed');
    return true; // allow server-to-server requests
  }
  const originNoSlash = origin.replace(/\/$/, '');
  // if no explicit allowed origins or patterns set, allow (useful for dev)
  if (allowedOrigins.length === 0 && allowedPatterns.length === 0) {
    if (DEBUG_CORS) console.log('[CORS] no allowed origins/patterns configured -> allowing origin', origin);
    return true;
  }
  if (allowedOrigins.includes(originNoSlash)) {
    if (DEBUG_CORS) console.log('[CORS] origin matched exact allow-list ->', origin);
    return true;
  }
  const patternMatch = allowedPatterns.some(rx => rx.test(origin));
  if (patternMatch) {
    if (DEBUG_CORS) console.log('[CORS] origin matched allowed pattern ->', origin);
    return true;
  }
  if (DEBUG_CORS) console.log('[CORS] origin NOT allowed ->', origin);
  return false;
}

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      // allow requests with no origin (like curl / mobile)
      if (!origin) return callback(null, true);
      if (originAllowed(origin)) return callback(null, true);
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
    if (!origin) return callback(null, true);
    if (originAllowed(origin)) return callback(null, true);
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
app.use('/api/api/auth', authRoutes);
app.use('/api/api/users', userRoutes);
app.use('/api/api/posts', postRoutes);
app.use('/api/api/blogs', blogRoutes);
app.use('/api/api/rooms', require('./routes/rooms'));
app.use('/api/api/notifications', require('./routes/notifications'));
app.use('/api/api/admin', require('./routes/admin'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Marwadi Connect Pro API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to inspect CORS config when DEBUG_CORS is enabled
if (process.env.DEBUG_CORS === 'true') {
  app.get('/debug/cors', (req, res) => {
    res.json({
      allowedOrigins,
      allowedPatterns: allowedPatterns.map(r => r.toString()),
      rawClientUrls: rawClientUrls || null,
      rawClientPatterns: rawClientPatterns || null,
    });
  });
}

app.get("/check-env", (req, res) => {
  res.json({
    CLIENT_URL: process.env.CLIENT_URL,
    SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN
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
