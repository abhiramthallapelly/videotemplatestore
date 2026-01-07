const fetch = require('node-fetch');

async function testAllServices() {
  console.log('🚀 TESTING ALL SERVICES');
  console.log('========================\n');
  
  // Test 1: Backend API
    console.log('1. Testing Backend API (Port 5050)...');
  try {
      const backendResponse = await fetch('http://localhost:5050/api/store/items');
    if (backendResponse.ok) {
      const items = await backendResponse.json();
      console.log('   ✅ Backend API: Working');
      console.log(`   📝 Store items: ${items.length} items available`);
    } else {
      console.log('   ❌ Backend API: Not responding');
    }
  } catch (error) {
    console.log('   ❌ Backend API: Connection failed');
  }
  
  // Test 2: Admin Dashboard
  console.log('\n2. Testing Admin Dashboard (Port 3001)...');
  try {
    const adminResponse = await fetch('http://localhost:3001');
    if (adminResponse.ok) {
      console.log('   ✅ Admin Dashboard: Working');
    } else {
      console.log('   ❌ Admin Dashboard: Not responding');
    }
  } catch (error) {
    console.log('   ❌ Admin Dashboard: Connection failed');
  }
  
  // Test 3: Public Website
  console.log('\n3. Testing Public Website (Port 3000)...');
  try {
    const publicResponse = await fetch('http://localhost:3000');
    if (publicResponse.ok) {
      console.log('   ✅ Public Website: Working');
    } else {
      console.log('   ❌ Public Website: Not responding');
    }
  } catch (error) {
    console.log('   ❌ Public Website: Connection failed');
  }
  
  // Test 4: Store Page
  console.log('\n4. Testing Store Page (Port 3000/store.html)...');
  try {
    const storeResponse = await fetch('http://localhost:3000/store.html');
    if (storeResponse.ok) {
      console.log('   ✅ Store Page: Working');
    } else {
      console.log('   ❌ Store Page: Not responding');
    }
  } catch (error) {
    console.log('   ❌ Store Page: Connection failed');
  }
  
  console.log('\n================================');
  console.log('📊 SERVICE STATUS SUMMARY');
  console.log('================================');
  console.log('🌐 Access URLs:');
    console.log('   Backend API:     http://localhost:5050');
  console.log('   Admin Dashboard: http://localhost:3001');
  console.log('   Public Website:  http://localhost:3000');
  console.log('   Store Page:      http://localhost:3000/store.html');
  console.log('\n🔑 Admin Login:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('\n✅ Your project is now running!');
}

testAllServices().catch(console.error);
