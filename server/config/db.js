const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers to resolve mongodb+srv records reliably on Windows/local networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setting DNS servers is not supported
}

let cachedPromise = null;

// Handle error event on connection to prevent unhandled error event crashes
mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Connection error event:', err.message);
});

const connectDB = async () => {
  // If already connected, reuse existing connection (crucial for serverless)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  // If running on Vercel and MONGODB_URI is not set, provide immediate clear error
  if (!process.env.MONGODB_URI && process.env.VERCEL) {
    throw new Error('MONGODB_URI environment variable is missing in Vercel settings.');
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cracker_shop';

  cachedPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  }).then((conn) => {
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  }).catch((error) => {
    cachedPromise = null;
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  });

  return cachedPromise;
};

module.exports = connectDB;
