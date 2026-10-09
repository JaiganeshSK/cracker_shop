const mongoose = require('mongoose');

// Global cached connection across serverless invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Prevent crash on connection errors
mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Connection error event:', err.message);
});

const connectDB = async () => {
  // 1. If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn) {
    return cached.conn;
  }

  // 2. Validate environment & fallback to Atlas cluster
  const DEFAULT_ATLAS_URI = 'mongodb+srv://jaizohobooks_db_user:NcbNWdP8zYXolzTv@jaiganesh.5m5nwfn.mongodb.net/cracker_shop?retryWrites=true&w=majority';
  const uri = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Do not buffer indefinitely in serverless
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected successfully: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
      return mongooseInstance;
    }).catch((error) => {
      cached.promise = null;
      console.error(`[MongoDB] Connection error: ${error.message}`);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

module.exports = connectDB;
