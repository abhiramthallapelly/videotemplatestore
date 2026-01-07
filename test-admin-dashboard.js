const fetch = require('node-fetch');

async function testAdminDashboard() {
  const backendUrl = 'http://localhost:5050';
  const dashboardUrl = 'http://localhost:3001';
  
  console.log('Testing Admin Dashboard Login Functionality...\n');
  
  // Test 1: Check if backend is accessible
  try {
    const healthResponse = await fetch(`${backendUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Backend is accessible');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }
  } catch (error) {
    console.log('❌ Backend is not accessible:', error.message);
    return;
  }
  
  // Test 2: Check if admin dashboard is accessible
  try {
    const dashboardResponse = await fetch(dashboardUrl);
    if (dashboardResponse.ok) {
      console.log('✅ Admin dashboard is accessible');
    } else {
      console.log('❌ Admin dashboard is not accessible');
      console.log('Status:', dashboardResponse.status);
    }
  } catch (error) {
    console.log('❌ Admin dashboard is not accessible:', error.message);
    console.log('Make sure the admin dashboard is running on port 3001');
  }
  
  // Test 3: Test admin login API endpoint
  console.log('\n3. Testing admin login API...');
  try {
    const loginResponse = await fetch(`${backendUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.token) {
      console.log('✅ Admin login API working correctly');
      console.log('Token received:', loginData.token.substring(0, 30) + '...');
      
      // Test 4: Test protected admin endpoints
      console.log('\n4. Testing protected admin endpoints...');
      
      // Test projects endpoint
      try {
        const projectsResponse = await fetch(`${backendUrl}/api/admin/projects`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        if (projectsResponse.ok) {
          console.log('✅ Projects endpoint accessible');
        } else {
          console.log('❌ Projects endpoint failed:', projectsResponse.status);
        }
      } catch (error) {
        console.log('❌ Projects endpoint error:', error.message);
      }
      
    } else {
      console.log('❌ Admin login API failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Admin login API error:', error.message);
  }
  
  // Test 5: Test user authentication endpoints
  console.log('\n5. Testing user authentication...');
  try {
    const userLoginResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      })
    });
    
    const userLoginData = await userLoginResponse.json();
    
    if (userLoginResponse.ok && userLoginData.token) {
      console.log('✅ User login API working correctly');
      console.log('User token received:', userLoginData.token.substring(0, 30) + '...');
    } else {
      console.log('❌ User login API failed:', userLoginData.message);
    }
  } catch (error) {
    console.log('❌ User login API error:', error.message);
  }
  
  console.log('\n=== Login Credentials ===');
  console.log('Admin Login:');
  console.log('  Username: admin');
  console.log('  Password: admin123');
  console.log('\nUser Login:');
  console.log('  Username: testuser');
  console.log('  Password: password123');
  console.log('\n=== URLs ===');
  console.log('Backend API: http://localhost:5050');
  console.log('Admin Dashboard: http://localhost:3001');
  console.log('Public Website: http://localhost:3000');
  
  console.log('\nTest completed!');
}

testAdminDashboard().catch(console.error);
