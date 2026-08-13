const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./db');
const errorHandler = require('./middlewares/errorHandler');
const { client } = require('../metrics');
const metricsMiddleware = require('./middlewares/metrics');

const authRoutes = require('./routes/auth');
const referenceRoutes = require('./routes/reference');
const notesRoutes = require('./routes/notes');
const constatationsRoutes = require('./routes/constatations');
const effectifsRoutes = require('./routes/effectifs');
const remarquesRoutes = require('./routes/remarques');
const foldersRoutes = require('./routes/folders');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(helmet());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);
app.use('/api/login', limiter);
app.use('/api/signup', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());


const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://d851o65hyxz9h.cloudfront.net',
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [])
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isLocalhost = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));
  const isAllowed = allowedOrigins.includes(origin) || isLocalhost;

  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'production') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(metricsMiddleware);

// Connect to MongoDB
connectDB().catch(err => console.error('Initial DB connection failed:', err));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: "Bienvenue sur l'API AppBTP",
    version: '1.0.0',
    status: 'running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: { login: 'POST /login', register: 'POST /register' },
      data: { effectif: 'POST /effectif', constatations: 'GET /constatations' },
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0'
  });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end();
  }
});

// API routes (all under /api prefix)
app.use('/api', authRoutes);
app.use('/api', referenceRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/constatations', constatationsRoutes);
app.use('/api', constatationsRoutes); // Mount rapportsPhotos aliases
app.use('/api/effectif', effectifsRoutes);
app.use('/api/effectifs', effectifsRoutes);
app.use('/api/remarques', remarquesRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api', foldersRoutes); // Mount photos routes
app.use('/api', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Start server (for local dev, not Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8081;
  const HOST = process.env.HOST || '0.0.0.0';

  const server = app.listen(PORT, HOST, () => {
    console.log(`Express server is running on port ${PORT}.`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${PORT} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection at:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
}

module.exports = app;
