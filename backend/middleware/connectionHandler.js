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
function checkDatabaseConnection() {
  return new Promise((resolve, reject) => {
    const db = require('../config/db');
    db.get('SELECT 1', (err) => {
      if (err) {
        reject(new Error(`Database connection failed: ${err.message}`));
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Middleware to handle connection errors
 */
const connectionErrorHandler = (err, req, res, next) => {
  // Database connection errors
  if (err.code === 'SQLITE_BUSY' || err.code === 'SQLITE_LOCKED') {
    logger.error('Database locked or busy:', err);
    return res.status(503).json({
      success: false,
      message: 'Database is temporarily unavailable. Please try again in a moment.',
      retryAfter: 5
    });
  }

  // Network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
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

