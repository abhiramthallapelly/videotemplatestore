/**
 * Test MongoDB Connection
 * Run this script to verify MongoDB connection is working
 * Usage: node scripts/test-mongodb.js
 */

require('dotenv').config({ 
  path: require('path').join(__dirname, '..', process.env.NODE_ENV === 'production' ? 'env.production' : 'env.development') 
});

const { connectDB, mongoose } = require('../config/mongodb');
const User = require('../models/User');
const Project = require('../models/Project');
const Category = require('../models/Category');

async function testConnection() {
  console.log('🧪 Testing MongoDB Connection...\n');
  
  try {
    // Test connection
    console.log('1️⃣ Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connection successful!\n');

    // Test database operations
    console.log('2️⃣ Testing database operations...');
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log(`   ✅ User model: ${userCount} users found`);
    
    // Test Project model
    const projectCount = await Project.countDocuments();
    console.log(`   ✅ Project model: ${projectCount} projects found`);
    
    // Test Category model
    const categoryCount = await Category.countDocuments();
    console.log(`   ✅ Category model: ${categoryCount} categories found`);
    
    // Test write operation
    console.log('\n3️⃣ Testing write operation...');
    const testCategory = await Category.findOneAndUpdate(
      { name: 'Test Category' },
      { name: 'Test Category', description: 'Test', icon: '🧪' },
      { upsert: true, new: true }
    );
    console.log(`   ✅ Write test successful: ${testCategory.name}`);
    
    // Clean up test data
    await Category.deleteOne({ name: 'Test Category' });
    console.log('   ✅ Cleanup successful');
    
    // Connection status
    console.log('\n4️⃣ Connection Status:');
    console.log(`   State: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    
    console.log('\n🎉 All tests passed! MongoDB is working correctly.');
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure MongoDB is running');
    console.error('      Windows: net start MongoDB');
    console.error('      macOS/Linux: mongod');
    console.error('   2. Check MONGODB_URI in env.development');
    console.error('   3. Verify MongoDB is accessible at the configured URI');
    process.exit(1);
  }
}

testConnection();

