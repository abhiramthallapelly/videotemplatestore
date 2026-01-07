require('dotenv').config({ path: require('path').join(__dirname, process.env.NODE_ENV === 'production' ? 'env.production' : 'env.development') });
console.log('SERVER_BOOT: loading server with NODE_ENV=' + (process.env.NODE_ENV || 'development'));
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { connectionErrorHandler, timeoutHandler, checkDatabaseConnection } = require('./middleware/connectionHandler');
const { apiLimiter, authLimiter, uploadLimiter, storeLimiter } = require('./middleware/rateLimiter');

// In development, skip strict auth rate limiting to avoid blocking tests
const authLimiterMiddleware = (process.env.NODE_ENV === 'production') ? authLimiter : (req, res, next) => next();

// Import routes
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');
const storeRoutes = require('./routes/store');
const analyticsRoutes = require('./routes/analytics');
const wishlistRoutes = require('./routes/wishlist');
const newsletterRoutes = require('./routes/newsletter');
const couponsRoutes = require('./routes/coupons');
const userRoutes = require('./routes/user');
const backupRoutes = require('./routes/backup');
const paymentsRoutes = require('./routes/payments');
const { initEmailTransporter } = require('./utils/email');

const app = express();
const PORT = process.env.PORT || 5050;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, enable in production
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// CORS configuration - Improved for better connection handling
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      return callback(null, true);
    }
    
    // In production, check allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [];
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400 // 24 hours
};

// CORS middleware
app.use(cors(corsOptions));

// Request timeout handler
app.use(timeoutHandler(30000)); // 30 seconds

// Body parsing middleware with increased limits
app.use(express.json({ 
  limit: '100mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ message: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Connection error handler
app.use(connectionErrorHandler);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

// Initialize email transporter
initEmailTransporter();

// API routes with rate limiting
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/public', apiLimiter, publicRoutes);
// Auth routes - apply rate limiting at route level, not middleware level to avoid conflicts
app.use('/api/auth', authLimiterMiddleware, authRoutes);
app.use('/api/auth', authLimiterMiddleware, oauthRoutes); // OAuth routes (facebook, instagram)
app.use('/api/store', storeLimiter, storeRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/wishlist', apiLimiter, wishlistRoutes);
app.use('/api/newsletter', apiLimiter, newsletterRoutes);
app.use('/api/coupons', apiLimiter, couponsRoutes);
app.use('/api/coupon-usage', apiLimiter, require('./routes/couponUsage'));
app.use('/api/user', apiLimiter, userRoutes);
app.use('/api/backup', apiLimiter, backupRoutes);
app.use('/api/payments', apiLimiter, paymentsRoutes);

// Health check route with database connection check
app.get('/api/health', async (req, res) => {
  try {
    const dbHealthy = await checkDatabaseConnection();
    res.json({ 
      status: 'Backend is running!',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'Backend is running but database is unavailable',
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve static website files from project root (index.html, store.html, etc.)
// This must come AFTER API routes but BEFORE the 404 handler
app.use(express.static(path.join(__dirname, '..')));

// Root route - serve index.html
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If index.html doesn't exist, send a simple welcome message
      res.json({
        success: true,
        message: 'Backend API is running!',
        endpoints: {
          health: '/api/health',
          store: '/api/store/items',
          admin: '/api/admin',
          auth: '/api/auth'
        },
        documentation: 'Visit /api/health for server status'
      });
    }
  });
});

// 404 handler for API routes (must come before general 404)
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API route not found',
    path: req.originalUrl
  });
});

// 404 handler for all other routes (must be last before error handler)
app.use(notFound);

// Global error handler (must be absolutely last)
app.use(errorHandler);

// Start server with error handling
console.log('About to start server on port', PORT);
const server = app.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`📊 Health check available at: http://localhost:${PORT}/api/health`);
  
  // Check database connection on startup
  try {
    await checkDatabaseConnection();
    logger.info('✅ Database connection verified');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
  }
  
  // Initialize email transporter
  initEmailTransporter();
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`❌ Port ${PORT} is already in use. Please use a different port or stop the other process.`);
    process.exit(1);
  } else {
    logger.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    const db = require('./config/db');
    db.close((err) => {
      if (err) {
        logger.error('Error closing database:', err);
      } else {
        logger.info('Database connection closed');
      }
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    const db = require('./config/db');
    db.close((err) => {
      if (err) {
        logger.error('Error closing database:', err);
      } else {
        logger.info('Database connection closed');
      }
      process.exit(0);
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
}); 