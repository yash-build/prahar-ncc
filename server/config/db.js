/**
 * MongoDB Connection
 * Uses Mongoose with retry logic for production reliability
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are defaults in Mongoose 6+ but explicit for clarity
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit process with failure — let hosting platform restart it
    process.exit(1);
  }
};

// Handle disconnect events (important for production)
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

module.exports = connectDB;
