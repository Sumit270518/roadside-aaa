const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roadside_aaa';
  const useInMemory = process.env.USE_IN_MEMORY_DB === 'true';

  if (useInMemory) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      console.log(`[Database] Starting In-Memory MongoDB Server for development/testing: ${inMemoryUri}`);
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`[Database] MongoDB Connected (In-Memory): ${conn.connection.host}`);
      return conn;
    } catch (inMemErr) {
      console.warn(`[Database] MongoMemoryServer initialization warning: ${inMemErr.message}`);
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[Database] Primary MongoDB connection failed (${uri}): ${err.message}`);
    
    // If not in production, attempt automatic fallback to in-memory mongodb for smooth developer experience
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Database] Attempting fallback to MongoMemoryServer...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const inMemoryUri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(inMemoryUri);
        console.log(`[Database] Connected successfully to In-Memory MongoDB fallback: ${inMemoryUri}`);
        return conn;
      } catch (fallbackErr) {
        console.error(`[Database] In-memory fallback failed: ${fallbackErr.message}`);
      }
    }

    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[Database] MongoDB connection closed');
  } catch (err) {
    console.error('[Database] Error closing connection:', err.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
