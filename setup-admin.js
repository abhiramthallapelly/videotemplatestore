const fetch = require('node-fetch');

async function setupAdmin() {
  const baseUrl = 'http://localhost:5050';
  
  console.log('Setting up admin user and testing login...\n');
  
  // Step 1: Register an admin user
  console.log('1. Registering admin user...');
  try {
    const registerResponse = await fetch(`${baseUrl}/api/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Admin user registered successfully');
    } else if (registerResponse.status === 400 && registerData.message === 'Admin already exists.') {
      console.log('✅ Admin user already exists');
    } else {
      console.log('❌ Admin registration failed:', registerData.message);
      return;
    }
  } catch (error) {
    console.log('❌ Admin registration error:', error.message);
    return;
  }
  
  // Step 2: Test admin login with correct credentials
  console.log('\n2. Testing admin login with correct credentials...');
  try {
    const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
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
      console.log('✅ Admin login successful');
      console.log('Token received:', loginData.token.substring(0, 20) + '...');
      
      // Step 3: Test protected admin endpoint
      console.log('\n3. Testing protected admin endpoint...');
      try {
        const protectedResponse = await fetch(`${baseUrl}/api/admin/projects`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        if (protectedResponse.ok) {
          console.log('✅ Protected admin endpoint accessible');
        } else {
          console.log('❌ Protected admin endpoint failed:', protectedResponse.status);
        }
      } catch (error) {
        console.log('❌ Protected endpoint error:', error.message);
      }
      
    } else {
      console.log('❌ Admin login failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
  }
  
  // Step 4: Test user registration and login
  console.log('\n4. Testing user registration and login...');
  try {
    const userRegisterResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      })
    });
    
    const userRegisterData = await userRegisterResponse.json();
    
    if (userRegisterResponse.ok) {
      console.log('✅ User registered successfully');
      
      // Test user login
      const userLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
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
        console.log('✅ User login successful');
        console.log('User token received:', userLoginData.token.substring(0, 20) + '...');
      } else {
        console.log('❌ User login failed:', userLoginData.message);
      }
      
    } else {
      console.log('❌ User registration failed:', userRegisterData.message);
    }
  } catch (error) {
    console.log('❌ User registration/login error:', error.message);
  }
  
  console.log('\nSetup and testing completed!');
}

setupAdmin().catch(console.error);
