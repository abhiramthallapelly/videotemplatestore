/**
 * Google OAuth Configuration Test Script
 * 
 * This script checks if Google OAuth is properly configured.
 * Run from project root: node test-google-oauth.js
 */

const fs = require('fs');
const path = require('path');

// Simple env file parser (no dotenv dependency needed)
function parseEnvFile(filePath) {
  const env = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
  return env;
}

// Load environment variables from backend/env.development
const envPath = path.join(__dirname, 'backend', 'env.development');
const env = parseEnvFile(envPath);

console.log('\n🔍 Google OAuth Configuration Check');
console.log('=====================================\n');

const clientId = env.GOOGLE_CLIENT_ID;
const clientSecret = env.GOOGLE_CLIENT_SECRET;
const redirectUri = env.GOOGLE_REDIRECT_URI || 'http://localhost:5050/api/auth/google/callback';

// Check if variables are set
console.log('1. Environment Variables:');
console.log('   Client ID:', clientId ? '✅ SET' : '❌ NOT SET');
console.log('   Client Secret:', clientSecret ? '✅ SET' : '❌ NOT SET');
console.log('   Redirect URI:', redirectUri);

// Validate Client ID format
if (clientId) {
  console.log('\n2. Client ID Validation:');
  const isValidFormat = clientId.includes('.apps.googleusercontent.com');
  console.log('   Format:', isValidFormat ? '✅ VALID' : '❌ INVALID');
  
  if (!isValidFormat) {
    console.log('   ⚠️  Client ID should end with: .apps.googleusercontent.com');
    console.log('   Current format:', clientId.substring(0, 50) + '...');
  } else {
    console.log('   Format looks correct');
  }
} else {
  console.log('\n2. Client ID Validation:');
  console.log('   ⚠️  Cannot validate - Client ID not set');
}

// Check redirect URI
console.log('\n3. Redirect URI Check:');
if (redirectUri.includes('localhost:5050')) {
  console.log('   ✅ Port 5050 detected (correct)');
} else if (redirectUri.includes('localhost:5000')) {
  console.log('   ⚠️  Port 5000 detected - should be 5050');
} else {
  console.log('   ℹ️  Using custom redirect URI');
}

// Overall status
console.log('\n4. Overall Status:');
const isConfigured = !!(clientId && clientSecret);
const isValid = isConfigured && clientId.includes('.apps.googleusercontent.com');

if (isValid) {
  console.log('   ✅ Google OAuth is properly configured!');
  console.log('\n   Next steps:');
  console.log('   1. Make sure the redirect URI in Google Cloud Console matches:');
  console.log('      ' + redirectUri);
  console.log('   2. Restart your backend server');
  console.log('   3. Test the OAuth flow');
} else if (isConfigured) {
  console.log('   ⚠️  Google OAuth is configured but Client ID format may be invalid');
  console.log('\n   Fix:');
  console.log('   1. Check your GOOGLE_CLIENT_ID in backend/env.development');
  console.log('   2. It should end with: .apps.googleusercontent.com');
  console.log('   3. Get the correct Client ID from Google Cloud Console');
} else {
  console.log('   ❌ Google OAuth is not configured');
  console.log('\n   To fix:');
  console.log('   1. Go to: https://console.cloud.google.com/');
  console.log('   2. Create OAuth 2.0 Client ID');
  console.log('   3. Add redirect URI:', redirectUri);
  console.log('   4. Copy Client ID and Secret to backend/env.development');
  console.log('   5. Restart backend server');
}

console.log('\n=====================================\n');

