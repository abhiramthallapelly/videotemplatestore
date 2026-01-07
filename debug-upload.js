const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function debugUpload() {
  console.log('🔍 DEBUGGING FILE UPLOAD ISSUE');
  console.log('================================\n');
  
  const backendUrl = 'http://localhost:5050';
  
  // Step 1: Login to get token
  console.log('1. Logging in to get authentication token...');
  let token;
  try {
    const loginResponse = await fetch(`${backendUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.token) {
      token = loginData.token;
      console.log('   ✅ Login successful, token received');
    } else {
      console.log('   ❌ Login failed:', loginData.message);
      return;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return;
  }
  
  // Step 2: Create a simple test file
  console.log('\n2. Creating test file...');
  const testFileName = 'debug-test.txt';
  const testFilePath = path.join(__dirname, testFileName);
  const testContent = 'Debug test file content.';
  
  try {
    fs.writeFileSync(testFilePath, testContent);
    console.log('   ✅ Test file created:', testFileName);
    console.log('   📝 File size:', fs.statSync(testFilePath).size, 'bytes');
  } catch (error) {
    console.log('   ❌ Error creating test file:', error.message);
    return;
  }
  
  // Step 3: Test file upload with detailed logging
  console.log('\n3. Testing file upload with detailed logging...');
  try {
    const formData = new FormData();
    formData.append('title', 'Debug Test Upload');
    formData.append('description', 'Testing upload functionality');
    formData.append('file', fs.createReadStream(testFilePath), {
      filename: testFileName,
      contentType: 'text/plain'
    });
    formData.append('is_free', '1');
    
    console.log('   📝 FormData created with fields:');
    console.log('   - title: Debug Test Upload');
    console.log('   - description: Testing upload functionality');
    console.log('   - file: ' + testFileName);
    console.log('   - is_free: 1');
    
    const uploadResponse = await fetch(`${backendUrl}/api/admin/projects`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    console.log('   📝 Response status:', uploadResponse.status);
    console.log('   📝 Response headers:', Object.fromEntries(uploadResponse.headers.entries()));
    
    let uploadData;
    try {
      uploadData = await uploadResponse.json();
      console.log('   📝 Response body:', uploadData);
    } catch (parseError) {
      console.log('   📝 Response body (not JSON):', await uploadResponse.text());
    }
    
    if (uploadResponse.ok) {
      console.log('   ✅ File upload successful!');
    } else {
      console.log('   ❌ File upload failed');
      
      // Check if it's a database error
      if (uploadData && uploadData.message === 'Error saving project.') {
        console.log('   🔍 This appears to be a database error');
        console.log('   🔍 Possible causes:');
        console.log('   - Database connection issue');
        console.log('   - Table schema mismatch');
        console.log('   - Constraint violation');
        console.log('   - File path issue');
      }
    }
  } catch (error) {
    console.log('   ❌ Upload error:', error.message);
    console.log('   🔍 Error stack:', error.stack);
  }
  
  // Step 4: Test database connection
  console.log('\n4. Testing database connection...');
  try {
    const healthResponse = await fetch(`${backendUrl}/api/health`);
    if (healthResponse.ok) {
      console.log('   ✅ Backend health check passed');
    } else {
      console.log('   ❌ Backend health check failed');
    }
  } catch (error) {
    console.log('   ❌ Health check error:', error.message);
  }
  
  // Step 5: Test projects listing
  console.log('\n5. Testing projects listing...');
  try {
    const projectsResponse = await fetch(`${backendUrl}/api/admin/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (projectsResponse.ok) {
      const projects = await projectsResponse.json();
      console.log('   ✅ Projects listing successful');
      console.log('   📝 Number of existing projects:', projects.length);
    } else {
      console.log('   ❌ Projects listing failed:', projectsResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Projects listing error:', error.message);
  }
  
  // Clean up test file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }
  
  console.log('\n================================');
  console.log('📊 DEBUG COMPLETED');
  console.log('================================');
}

debugUpload().catch(console.error);
