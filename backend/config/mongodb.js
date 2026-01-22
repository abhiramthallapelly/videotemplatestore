const mongoose = require('mongoose');

// MongoDB connection string from environment or default
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/video-editing-store';

// Connection options - improved for better reliability
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // Give initial connection 10 seconds
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true, // Retry write operations
  w: 'majority' // Write concern
};

// Retry connection with exponential backoff
const connectWithRetry = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(mongoURI, options);
      // Connection successful - let caller handle logging
      return conn;
    } catch (error) {
      const attempt = i + 1;
      
      if (attempt < retries) {
        const waitTime = delay * Math.pow(2, i); // Exponential backoff
        // Only log retry attempts, not the final success/failure
        if (attempt === 1) {
          console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);
        }
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // Last attempt failed - log detailed error
        console.error('❌ MongoDB connection failed after all retries');
        console.error('MongoDB URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
        console.error('\n💡 Troubleshooting tips:');
        console.error('   1. Make sure MongoDB is running: mongod (or net start MongoDB on Windows)');
        console.error('   2. Check if MongoDB is accessible at:', mongoURI.split('@').pop() || mongoURI);
        console.error('   3. For MongoDB Atlas, verify your connection string and network access');
        console.error('   4. Check firewall settings if using remote MongoDB');
        throw error;
      }
    }
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Handle connection events BEFORE connecting
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        if (mongoose.connection.readyState === 0) {
          connectWithRetry(3, 2000).catch(err => {
            console.error('❌ Auto-reconnect failed:', err.message);
          });
        }
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    // Event handlers are set up, but we log connection status in connectWithRetry
    // to avoid duplicate logging

    // Attempt connection with retry
    const conn = await connectWithRetry();
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('MongoDB URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs
    throw error; // Re-throw to let caller handle
  }
};

// Graceful shutdown
// Removed SIGINT handler to prevent interference with server operation

module.exports = { connectDB, mongoose };

