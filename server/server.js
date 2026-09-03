const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { setupSocket } = require('./services/socketHandler');
const seedProblems = require('./utils/seedProblems');

// ======================================================
// ROUTES
// ======================================================

const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const submissionRoutes = require('./routes/submissions');
const socialRoutes = require('./routes/social');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const recommendationRoutes = require('./routes/recommendations');

// ======================================================
// APP
// ======================================================

const app = express();
const server = http.createServer(app);

// ======================================================
// ENVIRONMENT
// ======================================================

const PORT = process.env.PORT || 5000;

const allowedOrigin =
  process.env.CLIENT_URL || 'http://localhost:5173';

console.log('======================================');
console.log('Starting Dev Match Backend');
console.log('PORT:', PORT);
console.log('CLIENT_URL:', allowedOrigin);
console.log('======================================');

// ======================================================
// CORS
// ======================================================

const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
};

// CORS middleware
app.use(cors(corsOptions));

// IMPORTANT:
// Explicitly handle ALL OPTIONS requests.
// Do NOT use app.options(/.*/, ...)

app.use((req, res, next) => {

  if (req.method === 'OPTIONS') {

    console.log('======================================');
    console.log('CORS PREFLIGHT REQUEST');
    console.log('Path:', req.originalUrl);
    console.log('Origin:', req.headers.origin);
    console.log(
      'Requested Method:',
      req.headers['access-control-request-method']
    );
    console.log(
      'Requested Headers:',
      req.headers['access-control-request-headers']
    );
    console.log('======================================');

    const requestOrigin = req.headers.origin;

    // Allow the deployed frontend
    if (requestOrigin === allowedOrigin) {
      res.setHeader(
        'Access-Control-Allow-Origin',
        allowedOrigin
      );

      res.setHeader(
        'Access-Control-Allow-Credentials',
        'true'
      );
    }

    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );

    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    return res.status(204).end();
  }

  next();
});

// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json({ limit: '10mb' }));

// ======================================================
// ROOT TEST
// ======================================================

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Dev Match Backend is running',
    status: 'ok'
  });
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ======================================================
// SOCKET.IO
// ======================================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST']
  }
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
// 404 HANDLER
// ======================================================

app.use((req, res) => {

  console.log(
    '404:',
    req.method,
    req.originalUrl
  );

  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl
  });

});

// ======================================================
// SOCKET HANDLER
// ======================================================

setupSocket(io);

// ======================================================
// START SERVER
// ======================================================

const start = async () => {

  try {

    console.log('Connecting to MySQL...');

    await connectDB();

    console.log('MySQL connection successful');

    await seedProblems();

    console.log('Database initialization complete');

    server.listen(
      PORT,
      '0.0.0.0',
      () => {

        console.log('======================================');
        console.log(`Server running on port ${PORT}`);
        console.log(`Client URL: ${allowedOrigin}`);
        console.log('======================================');

      }
    );

  } catch (error) {

    console.error(
      'Failed to start server:',
      error
    );

    process.exit(1);

  }

};

start();