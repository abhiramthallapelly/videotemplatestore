const fetch = require('node-fetch');

async function testStore() {
  console.log('🔍 TESTING STORE DATA LOADING');
  console.log('==============================\n');
  
  const backendUrl = 'http://localhost:5050';
  
  // Test 1: Categories endpoint
  console.log('1. Testing categories endpoint...');
  try {
    const categoriesResponse = await fetch(`${backendUrl}/api/store/categories`);
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('   ✅ Categories loaded successfully');
      console.log('   📝 Number of categories:', categories.length);
      categories.forEach(cat => {
        console.log(`      - ${cat.icon} ${cat.name}`);
      });
    } else {
      console.log('   ❌ Categories failed:', categoriesResponse.status);
    }
  } catch (error) {
    console.log('   ❌ Categories error:', error.message);
  }
  
  // Test 2: Store items endpoint
  console.log('\n2. Testing store items endpoint...');
  try {
    const itemsResponse = await fetch(`${backendUrl}/api/store/items`);
    if (itemsResponse.ok) {
      const items = await itemsResponse.json();
      console.log('   ✅ Store items loaded successfully');
      console.log('   📝 Number of items:', items.length);
      
      if (items.length > 0) {
        console.log('   📋 Sample items:');
        items.slice(0, 3).forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.title} (ID: ${item.id})`);
          console.log(`         - Free: ${item.is_free ? 'Yes' : 'No'}`);
          console.log(`         - Price: $${item.price || 0}`);
          console.log(`         - Category: ${item.category || 'None'}`);
        });
      }
    } else {
      const errorData = await itemsResponse.json();
      console.log('   ❌ Store items failed:', itemsResponse.status);
      console.log('   📝 Error message:', errorData.message);
    }
  } catch (error) {
    console.log('   ❌ Store items error:', error.message);
  }
  
  // Test 3: Direct database query test
  console.log('\n3. Testing database connection...');
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
  
  // Test 4: Admin projects endpoint (to compare)
  console.log('\n4. Testing admin projects endpoint...');
  try {
    // First login to get token
    const loginResponse = await fetch(`${backendUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      
      const adminProjectsResponse = await fetch(`${backendUrl}/api/admin/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (adminProjectsResponse.ok) {
        const adminProjects = await adminProjectsResponse.json();
        console.log('   ✅ Admin projects loaded successfully');
        console.log('   📝 Number of admin projects:', adminProjects.length);
        
        if (adminProjects.length > 0) {
          console.log('   📋 Sample admin projects:');
          adminProjects.slice(0, 3).forEach((project, index) => {
            console.log(`      ${index + 1}. ${project.title} (ID: ${project.id})`);
            console.log(`         - Free: ${project.is_free ? 'Yes' : 'No'}`);
            console.log(`         - Price: $${project.price || 0}`);
            console.log(`         - Category: ${project.category || 'None'}`);
          });
        }
      } else {
        console.log('   ❌ Admin projects failed:', adminProjectsResponse.status);
      }
    } else {
      console.log('   ❌ Admin login failed');
    }
  } catch (error) {
    console.log('   ❌ Admin projects error:', error.message);
  }
  
  console.log('\n================================');
  console.log('📊 STORE TEST COMPLETED');
  console.log('================================');
}

testStore().catch(console.error);
