const fetch = require('node-fetch');

async function testLogin() {
  const baseUrl = 'http://localhost:5050';
  
  console.log('Testing login functionality...\n');
  
  // Test 1: Check if backend is running
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('Error:', error.message);
    return;
  }
  
  // Test 2: Test admin login with invalid credentials
  try {
    const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test',
        password: 'wrongpassword'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.status === 400) {
      console.log('✅ Admin login endpoint is working (correctly rejected invalid credentials)');
    } else {
      console.log('❌ Admin login endpoint returned unexpected status:', loginResponse.status);
      console.log('Response:', loginData);
    }
  } catch (error) {
    console.log('❌ Admin login endpoint error:', error.message);
  }
  
  // Test 3: Test user login with invalid credentials
  try {
    const userLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test',
        password: 'wrongpassword'
      })
    });
    
    const userLoginData = await userLoginResponse.json();
    
    if (userLoginResponse.status === 401) {
      console.log('✅ User login endpoint is working (correctly rejected invalid credentials)');
    } else {
      console.log('❌ User login endpoint returned unexpected status:', userLoginResponse.status);
      console.log('Response:', userLoginData);
    }
  } catch (error) {
    console.log('❌ User login endpoint error:', error.message);
  }
  
  console.log('\nTest completed. Check the results above.');
}

testLogin().catch(console.error);
