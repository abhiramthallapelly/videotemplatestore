const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple HTTP request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testBackend() {
  console.log('🧪 Testing Backend Upload Functionality...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await makeRequest('http://localhost:5050/api/health');
    if (healthResponse.status === 200) {
      console.log('✅ Health Check OK:', healthResponse.data);
    } else {
      console.log('❌ Health Check Failed:', healthResponse.status);
      return;
    }

    // Test 2: Admin Login
    console.log('\n2️⃣ Testing Admin Login...');
    const loginResponse = await makeRequest('http://localhost:5050/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Admin Login Failed:', loginResponse.status);
      console.log('Response:', loginResponse.data);
      console.log('💡 You may need to register an admin first');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Admin Login OK, Token received');

    // Test 3: Upload Test
    console.log('\n3️⃣ Testing File Upload...');
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload testing');

    // For file upload, we need to create a multipart form
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    const formData = [
      '--' + boundary,
      'Content-Disposition: form-data; name="title"',
      '',
      'Test Project',
      '--' + boundary,
      'Content-Disposition: form-data; name="description"',
      '',
      'Test description',
      '--' + boundary,
      'Content-Disposition: form-data; name="is_free"',
      '',
      '1',
      '--' + boundary,
      'Content-Disposition: form-data; name="file"; filename="test-file.txt"',
      'Content-Type: text/plain',
      '',
      fs.readFileSync(testFilePath, 'utf8'),
      '--' + boundary + '--'
    ].join('\r\n');

    const uploadResponse = await makeRequest('http://localhost:5050/api/admin/projects', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      },
      body: formData
    });

    if (uploadResponse.status === 200) {
      console.log('✅ File Upload OK:', uploadResponse.data);
    } else {
      console.log('❌ File Upload Failed:', uploadResponse.status);
      console.log('Response:', uploadResponse.data);
    }

    // Clean up test file
    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Check if backend is running
async function checkBackendStatus() {
  try {
    const response = await makeRequest('http://localhost:5050/api/health');
    if (response.status === 200) {
      console.log('🚀 Backend is running, starting tests...\n');
      await testBackend();
    } else {
      console.log('❌ Backend is not responding properly');
    }
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('💡 Make sure to start the backend server first:');
    console.log('   cd backend && npm start');
  }
}

checkBackendStatus();
