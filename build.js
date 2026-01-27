#!/usr/bin/env node

/**
 * Build script for Render deployment
 * Unified dependency management
 */

const { execSync } = require('child_process');

console.log('🔨 Starting build process...');
console.log('📦 Ensuring root dependencies are installed...');

try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('✅ Build completed successfully');

