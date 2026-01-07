/**
 * Script to register an admin account
 * Run with: node register-admin.js
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5050';
const adminData = {
  username: 'abhiramcreations',
  password: 'creation@2005'
};

async function registerAdmin() {
  try {
    console.log('Registering admin account...');
    console.log('Username:', adminData.username);
    console.log('');

    const response = await fetch(`${API_BASE_URL}/api/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Admin account created successfully!');
      console.log('');
      console.log('You can now login to the admin dashboard at:');
      console.log('http://localhost:3001');
      console.log('');
      console.log('Credentials:');
      console.log('Username:', adminData.username);
      console.log('Password:', adminData.password);
    } else {
      console.log('❌ ERROR:', result.message);
      if (result.message && result.message.includes('already exists')) {
        console.log('');
        console.log('Admin account already exists. You can login directly.');
      }
    }
  } catch (error) {
    console.error('❌ ERROR: Failed to connect to backend server.');
    console.error('');
    console.error('Make sure the backend server is running:');
    console.error('  cd backend');
    console.error('  npm start');
    console.error('');
    console.error('Then run this script again:');
    console.error('  node register-admin.js');
    process.exit(1);
  }
}

registerAdmin();

