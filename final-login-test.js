const fetch = require('node-fetch');

async function finalLoginTest() {
  console.log('🔍 FINAL LOGIN OPERATIONS TEST');
  console.log('================================\n');
  
  const backendUrl = 'http://localhost:5050';
  const dashboardUrl = 'http://localhost:3001';
  
  let allTestsPassed = true;
  
  // Test 1: Backend Health
  console.log('1. Testing Backend Health...');
  try {
    const healthResponse = await fetch(`${backendUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('   ✅ Backend is healthy and running');
    } else {
      console.log('   ❌ Backend health check failed');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Backend is not accessible:', error.message);
    allTestsPassed = false;
  }
  
  // Test 2: Admin Dashboard Accessibility
  console.log('\n2. Testing Admin Dashboard...');
  try {
    const dashboardResponse = await fetch(dashboardUrl);
    if (dashboardResponse.ok) {
      console.log('   ✅ Admin dashboard is accessible');
    } else {
      console.log('   ❌ Admin dashboard is not accessible');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Admin dashboard is not accessible:', error.message);
    allTestsPassed = false;
  }
  
  // Test 3: Admin Login
  console.log('\n3. Testing Admin Login...');
  try {
    const adminLoginResponse = await fetch(`${backendUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const adminLoginData = await adminLoginResponse.json();
    
    if (adminLoginResponse.ok && adminLoginData.token) {
      console.log('   ✅ Admin login successful');
      console.log('   📝 Token received:', adminLoginData.token.substring(0, 30) + '...');
      
      // Test 4: Admin Protected Endpoint
      console.log('\n4. Testing Admin Protected Endpoint...');
      try {
        const projectsResponse = await fetch(`${backendUrl}/api/admin/projects`, {
          headers: { 'Authorization': `Bearer ${adminLoginData.token}` }
        });
        
        if (projectsResponse.ok) {
          console.log('   ✅ Admin protected endpoint accessible');
        } else {
          console.log('   ❌ Admin protected endpoint failed');
          allTestsPassed = false;
        }
      } catch (error) {
        console.log('   ❌ Admin protected endpoint error:', error.message);
        allTestsPassed = false;
      }
      
    } else {
      console.log('   ❌ Admin login failed:', adminLoginData.message);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Admin login error:', error.message);
    allTestsPassed = false;
  }
  
  // Test 5: User Login
  console.log('\n5. Testing User Login...');
  try {
    const userLoginResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      })
    });
    
    const userLoginData = await userLoginResponse.json();
    
    if (userLoginResponse.ok && userLoginData.token) {
      console.log('   ✅ User login successful');
      console.log('   📝 Token received:', userLoginData.token.substring(0, 30) + '...');
    } else {
      console.log('   ❌ User login failed:', userLoginData.message);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ User login error:', error.message);
    allTestsPassed = false;
  }
  
  // Test 6: Invalid Credentials
  console.log('\n6. Testing Invalid Credentials...');
  try {
    const invalidLoginResponse = await fetch(`${backendUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'wronguser',
        password: 'wrongpass'
      })
    });
    
    if (invalidLoginResponse.status === 400) {
      console.log('   ✅ Invalid credentials properly rejected');
    } else {
      console.log('   ❌ Invalid credentials not properly handled');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Invalid credentials test error:', error.message);
    allTestsPassed = false;
  }
  
  // Final Results
  console.log('\n================================');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('================================');
  
  if (allTestsPassed) {
    console.log('🎉 ALL LOGIN OPERATIONS ARE WORKING CORRECTLY!');
    console.log('\n✅ Backend API: http://localhost:5050');
    console.log('✅ Admin Dashboard: http://localhost:3001');
    console.log('✅ JWT Authentication: Working');
    console.log('✅ Protected Endpoints: Accessible');
    console.log('✅ Error Handling: Proper');
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('   Admin:');
    console.log('     Username: admin');
    console.log('     Password: admin123');
    console.log('     URL: http://localhost:3001');
    console.log('\n   User:');
    console.log('     Username: testuser');
    console.log('     Password: password123');
    console.log('     Email: test@example.com');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Open http://localhost:3001 in your browser');
    console.log('   2. Login with admin/admin123');
    console.log('   3. You should see the admin dashboard');
    console.log('   4. All login operations are functional!');
    
  } else {
    console.log('❌ SOME LOGIN OPERATIONS HAVE ISSUES');
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Check if backend is running: cd backend && npm start');
    console.log('   2. Check if admin dashboard is running: cd admin-dashboard && npm start');
    console.log('   3. Check browser console for errors');
    console.log('   4. Verify network connectivity');
  }
  
  console.log('\n================================');
}

finalLoginTest().catch(console.error);
