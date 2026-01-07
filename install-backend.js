#!/usr/bin/env node

/**
 * Install backend dependencies
 * This script is used by postinstall to install backend dependencies
 * without using shell operators that Render doesn't support
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('📦 Installing backend dependencies...');

const backendPath = path.join(__dirname, 'backend');
const packageJsonPath = path.join(backendPath, 'package.json');

// Check if backend directory exists
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend directory not found:', backendPath);
  process.exit(1);
}

// Check if package.json exists
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Backend package.json not found:', packageJsonPath);
  process.exit(1);
}

try {
  // Change to backend directory
  const originalDir = process.cwd();
  process.chdir(backendPath);
  
  console.log('📂 Changed to backend directory:', backendPath);
  console.log('🔧 Running npm install...');
  
  // Run npm install with explicit output
  execSync('npm install', { 
    stdio: 'inherit',
    cwd: backendPath,
    env: process.env
  });
  
  console.log('✅ Backend dependencies installed successfully');
  
  // Change back to original directory
  process.chdir(originalDir);
} catch (error) {
  console.error('❌ Error installing backend dependencies:');
  console.error('   Message:', error.message);
  if (error.stdout) console.error('   stdout:', error.stdout.toString());
  if (error.stderr) console.error('   stderr:', error.stderr.toString());
  process.exit(1);
}

