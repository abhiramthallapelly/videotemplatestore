const logger = require('../utils/logger');

// Connection retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, retries = MAX_RETRIES, delay = RETRY_DELAY) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    
    logger.warn(`Retry attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}: ${error.message}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Database connection health check
 */
async function checkDatabaseConnection() {
  try {
    const mongoose = require('mongoose');
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === 1) {
      return true;
    } else {
      throw new Error(`MongoDB connection state: ${mongoose.connection.readyState}`);
    }
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

/**
 * Middleware to handle connection errors
 */
const connectionErrorHandler = (err, req, res, next) => {
  // MongoDB connection errors
  if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
    logger.error('MongoDB connection error:', err);
    return res.status(503).json({
      success: false,
      message: 'Database is temporarily unavailable. Please try again in a moment.',
      retryAfter: 5
    });
  }

  // Network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
    logger.error('Connection error:', err);
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Please try again later.',
      retryAfter: 10
    });
  }

  next(err);
};

/**
 * Request timeout handler
 */
const timeoutHandler = (timeout = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      if (!res.headersSent) {
        logger.warn(`Request timeout: ${req.method} ${req.originalUrl}`);
        res.status(408).json({
          success: false,
          message: 'Request timeout. Please try again.'
        });
      }
    });
    next();
  };
};

module.exports = {
  retryWithBackoff,
  checkDatabaseConnection,
  connectionErrorHandler,
  timeoutHandler
};

