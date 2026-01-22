/**
 * Directory Setup Module
 * This module ensures required directories exist.
 * Note: Database operations now use MongoDB via backend/config/mongodb.js
 */

const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(__dirname, '../uploads/images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Export empty object for backward compatibility
// Routes should use MongoDB models instead of this module
module.exports = {};
