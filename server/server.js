const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize MongoDB connection
connectDB().catch(err => console.error('Initial DB connection failed:', err.message));

const app = express();

// Trust proxy for Vercel and reverse proxies
app.set('trust proxy', 1);

// URL normalization for Vercel Serverless Functions
app.use((req, res, next) => {
  const matched = req.headers['x-matched-path'] || req.headers['x-now-route-matches'];
  if (matched && (req.url === '/api/index.js' || req.url.startsWith('/api/index.js'))) {
    req.url = matched;
  }
  next();
});

// Middlewares - allow request origin dynamically so Vercel preview & production URLs succeed
app.use(cors({
  origin: true,
  credentials: true,
}));

// Apply global rate limiting to API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit requests per window
  message: { success: false, message: 'Too many requests, please try again after a few minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

app.use('/api', apiLimiter);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory for WebP images
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '30d', // Optimal browser caching for images
  immutable: true,
}));

// Ensure DB is connected before handling API routes in serverless
app.use(async (req, res, next) => {
  const isApi = req.path.startsWith('/api') ||
                req.path.startsWith('/orders') ||
                req.path.startsWith('/products') ||
                req.path.startsWith('/categories') ||
                req.path.startsWith('/auth') ||
                req.path.startsWith('/settings') ||
                req.path.startsWith('/upload');

  if (!isApi || req.path === '/api/health' || req.path === '/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed in API middleware:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please check MongoDB Atlas network access (allow 0.0.0.0/0).',
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

// Production: Serve React client build from client/dist with dynamic Open Graph injection for WhatsApp/Social share
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  const indexPath = path.join(clientBuildPath, 'index.html');
  const fs = require('fs');
  const Setting = require('./models/Setting');

  app.use(express.static(clientBuildPath));

  app.get('*', async (req, res) => {
    // If request does not start with /api or /uploads, serve React index.html
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      try {
        if (!fs.existsSync(indexPath)) {
          return res.status(404).send('Application build not found.');
        }

        let html = fs.readFileSync(indexPath, 'utf8');
        const host = req.get('host') || 'localhost:5000';
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const origin = `${protocol}://${host}`;

        // Fetch store settings from MongoDB
        const setting = await Setting.findOne().catch(() => null);
        const shopName = setting?.shopName || 'Festive Spark Fireworks';
        const tagline = setting?.tagline || 'Direct Sivakasi Factory Fireworks & Crackers';
        const logoUrl = setting?.logoUrl || `${origin}/og-image.png`;
        const fullLogoUrl = logoUrl.startsWith('http') ? logoUrl : `${origin}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;

        // Inject absolute Open Graph tags so WhatsApp, Facebook, iMessage crawlers display rich logo cards
        html = html
          .replace(/<title>.*?<\/title>/, `<title>${shopName} | ${tagline}</title>`)
          .replaceAll('%VITE_SITE_URL%/og-image.png', fullLogoUrl)
          .replaceAll('/og-image.png', fullLogoUrl)
          .replaceAll('/asmi-tech-logo.png', fullLogoUrl);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
      } catch (err) {
        console.error('Error serving index.html with OG tags:', err);
        res.sendFile(indexPath);
      }
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

if (!process.env.VERCEL && require.main === module) {
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
// touch
