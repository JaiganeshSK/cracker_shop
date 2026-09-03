const mongoose = require('mongoose');

const connectDB = async () => {
  // If already connected, reuse existing connection (crucial for serverless)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If running on Vercel and MONGODB_URI is not set, provide immediate clear error
  if (!process.env.MONGODB_URI && process.env.VERCEL) {
    throw new Error('MONGODB_URI environment variable is missing in Vercel settings.');
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cracker_shop';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Only exit process if not in a serverless environment like Vercel
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
