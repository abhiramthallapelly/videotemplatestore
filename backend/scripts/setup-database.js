#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script initializes the database with all required tables.
 * Run this script once to set up your database.
 * 
 * Usage: node backend/scripts/setup-database.js
 */

require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? './env.production' : './env.development' });
const db = require('../config/db');

console.log('Database setup completed!');
console.log('All tables have been created and initialized.');
console.log('\nYou can now start the server with: npm start');

// Close database connection
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
      process.exit(0);
    }
  });
}, 1000);

