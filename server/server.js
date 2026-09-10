const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize MongoDB connection
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: true, // Reflect request origin or specify allowed origins
  credentials: true,
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory for WebP images
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '30d', // Optimal browser caching for images
  immutable: true,
}));

// Ensure DB is connected before handling API routes in serverless
app.use('/api', async (req, res, next) => {
  // Allow health check to run without blocking, so user can diagnose DB issues
  if (req.path === '/health') return next();

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed in API middleware:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please check MONGODB_URI in Vercel settings and allow 0.0.0.0/0 in MongoDB Atlas.',
      error: err.message,
    });
  }
});

// Health check endpoint with database diagnostics
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  let dbStatus = 'disconnected';
  let dbError = null;

  try {
    await connectDB();
    dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
  } catch (err) {
    dbStatus = 'error';
    dbError = err.message;
  }

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Cracker Shop API',
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'none',
      name: mongoose.connection.name || 'none',
      uriConfigured: Boolean(process.env.MONGODB_URI),
      error: dbError,
    },
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

// Fallback direct mounts for serverless / direct proxies
app.use('/auth', require('./routes/authRoutes'));
app.use('/categories', require('./routes/categoryRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
app.use('/upload', require('./routes/uploadRoutes'));
app.use('/settings', require('./routes/settingRoutes'));

// Production: Serve React client build from client/dist
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    // If request does not start with /api or /uploads, serve React index.html
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    } else {
      res.status(404).json({ success: false, message: 'Resource not found' });
    }
  });
}

// Global 404 handler for API routes
app.use(['/api/*', '/api'], (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Uncaught Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🧨 Cracker Shop Server running on port ${PORT}`);
    console.log(`🌐 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📦 WebP Uploads Directory: ${uploadsPath}`);
    console.log(`=========================================`);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
  });
}

module.exports = app;
