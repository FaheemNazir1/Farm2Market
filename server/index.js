const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables FIRST (loads server/.env whether started from root or server dir)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// ============================================================
// CORS CONFIGURATION (Vercel Frontend <-> Render Backend)
// ============================================================
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (e.g. mobile, curl, server-to-server, health checks)
    if (!origin) return callback(null, true);

    // Check if origin matches allowed list or any .vercel.app domain
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === origin) return true;
      if (allowed.includes('*')) {
        const regex = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return false;
    });

    const isVercel = /^https:\/\/.*\.vercel\.app$/.test(origin);

    if (isAllowed || isVercel) {
      return callback(null, true);
    }

    // Allow all other origins in production with credentials support to avoid blocking preview deployments
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/cart', require('./routes/cart'));

// Health check endpoint for Render/uptime monitoring
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'OK',
    message: 'Farm2Market API is running',
    database: states[dbState] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root route for simple verification
app.get('/', (req, res) => {
  res.json({
    name: 'Farm2Market API',
    version: '1.0.0',
    status: 'online',
    docs: '/api/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ============================================================
// DATABASE CONNECTION & SERVER STARTUP
// ============================================================
const MONGODB_URI = process.env.MONGODB_URI;

const startServer = async () => {
  try {
    if (!MONGODB_URI) {
      console.error('FATAL: MONGODB_URI is not set in environment variables.');
      process.exit(1);
    }

    // Connect to MongoDB Atlas first
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Atlas connected successfully');

    // Seed default accounts and sample data if database is empty
    const { seedDatabaseIfEmpty } = require('./seedDatabase');
    await seedDatabaseIfEmpty();

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Start listening on PORT only after MongoDB connection is confirmed
    if (require.main === module) {
      const server = app.listen(PORT, () => {
        console.log(`🚀 Farm2Market Server running on port ${PORT}`);
      });

      // Graceful shutdown handling
      const shutdown = async () => {
        console.log('\nGracefully shutting down server...');
        server.close(async () => {
          await mongoose.connection.close(false);
          console.log('MongoDB connection closed. Process exiting.');
          process.exit(0);
        });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;