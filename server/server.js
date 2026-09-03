const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { setupSocket } = require('./services/socketHandler');
const seedProblems = require('./utils/seedProblems');

// Route imports
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const submissionRoutes = require('./routes/submissions');
const socialRoutes = require('./routes/social');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const recommendationRoutes = require('./routes/recommendations');

const app = express();
const server = http.createServer(app);

// ======================================================
// CORS CONFIGURATION
// ======================================================

const allowedOrigin =
  process.env.CLIENT_URL || 'http://localhost:5173';

const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Express CORS
app.use(cors(corsOptions));

// Explicitly handle browser preflight requests
app.options(/.*/, cors(corsOptions));

// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json({ limit: '10mb' }));

// ======================================================
// SOCKET.IO
// ======================================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// ======================================================
// API ROUTES
// ======================================================

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recommendations', recommendationRoutes);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ======================================================
// SOCKET HANDLER
// ======================================================

setupSocket(io);

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    await seedProblems();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Client URL: ${allowedOrigin}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();