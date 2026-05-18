const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in server/.env');
  }
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser:              true,
    useUnifiedTopology:           true,
    serverSelectionTimeoutMS:     15000,
    socketTimeoutMS:              45000,
    heartbeatFrequencyMS:         10000,
  });
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
