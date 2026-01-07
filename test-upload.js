const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  console.log('🔍 TESTING FILE UPLOAD FUNCTIONALITY');
  console.log('=====================================\n');
  
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
  
  // Step 2: Create a test file
  console.log('\n2. Creating test file...');
  const testFileName = 'test-upload-file.txt';
  const testFilePath = path.join(__dirname, testFileName);
  const testContent = 'This is a test file for upload functionality.';
  
  try {
    fs.writeFileSync(testFilePath, testContent);
    console.log('   ✅ Test file created:', testFileName);
  } catch (error) {
    console.log('   ❌ Error creating test file:', error.message);
    return;
  }
  
  // Step 3: Test file upload
  console.log('\n3. Testing file upload...');
  try {
    const formData = new FormData();
    formData.append('title', 'Test Upload File');
    formData.append('description', 'This is a test upload to check functionality');
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('is_free', '1');
    
    const uploadResponse = await fetch(`${backendUrl}/api/admin/projects`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
        // Note: Don't set Content-Type for FormData, let it be set automatically
      },
      body: formData
    });
    
    const uploadData = await uploadResponse.json();
    
    if (uploadResponse.ok) {
      console.log('   ✅ File upload successful!');
      console.log('   📝 Response:', uploadData);
    } else {
      console.log('   ❌ File upload failed');
      console.log('   📝 Status:', uploadResponse.status);
      console.log('   📝 Error:', uploadData.message);
      
      // Additional debugging
      console.log('\n   🔍 Debugging information:');
      console.log('   - Request URL:', `${backendUrl}/api/admin/projects`);
      console.log('   - Token present:', !!token);
      console.log('   - FormData created:', !!formData);
      console.log('   - File exists:', fs.existsSync(testFilePath));
    }
  } catch (error) {
    console.log('   ❌ Upload error:', error.message);
    console.log('   🔍 Error details:', error);
  }
  
  // Step 4: Test with image upload
  console.log('\n4. Testing image upload...');
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageName = 'test-image.png';
    const testImagePath = path.join(__dirname, testImageName);
    
    // Create a minimal PNG file (base64 encoded 1x1 transparent PNG)
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');
    fs.writeFileSync(testImagePath, pngBuffer);
    
    const formDataWithImage = new FormData();
    formDataWithImage.append('title', 'Test Upload with Image');
    formDataWithImage.append('description', 'This is a test upload with image');
    formDataWithImage.append('file', fs.createReadStream(testFilePath));
    formDataWithImage.append('image', fs.createReadStream(testImagePath));
    formDataWithImage.append('is_free', '1');
    
    const imageUploadResponse = await fetch(`${backendUrl}/api/admin/projects`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: formDataWithImage
    });
    
    const imageUploadData = await imageUploadResponse.json();
    
    if (imageUploadResponse.ok) {
      console.log('   ✅ Image upload successful!');
      console.log('   📝 Response:', imageUploadData);
    } else {
      console.log('   ❌ Image upload failed');
      console.log('   📝 Status:', imageUploadResponse.status);
      console.log('   📝 Error:', imageUploadData.message);
    }
    
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
  } catch (error) {
    console.log('   ❌ Image upload error:', error.message);
  }
  
  // Step 5: Test large file upload
  console.log('\n5. Testing large file upload...');
  try {
    const largeFileName = 'large-test-file.txt';
    const largeFilePath = path.join(__dirname, largeFileName);
    
    // Create a 5MB file
    const largeContent = 'A'.repeat(5 * 1024 * 1024); // 5MB of data
    fs.writeFileSync(largeFilePath, largeContent);
    
    const largeFormData = new FormData();
    largeFormData.append('title', 'Large Test File');
    largeFormData.append('description', 'Testing large file upload');
    largeFormData.append('file', fs.createReadStream(largeFilePath));
    largeFormData.append('is_free', '1');
    
    const largeUploadResponse = await fetch(`${backendUrl}/api/admin/projects`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: largeFormData
    });
    
    const largeUploadData = await largeUploadResponse.json();
    
    if (largeUploadResponse.ok) {
      console.log('   ✅ Large file upload successful!');
      console.log('   📝 Response:', largeUploadData);
    } else {
      console.log('   ❌ Large file upload failed');
      console.log('   📝 Status:', largeUploadResponse.status);
      console.log('   📝 Error:', largeUploadData.message);
    }
    
    // Clean up large file
    if (fs.existsSync(largeFilePath)) {
      fs.unlinkSync(largeFilePath);
    }
    
  } catch (error) {
    console.log('   ❌ Large file upload error:', error.message);
  }
  
  // Clean up test file
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }
  
  console.log('\n=====================================');
  console.log('📊 UPLOAD TEST COMPLETED');
  console.log('=====================================');
}

testUpload().catch(console.error);
