import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Establish connection to MongoDB.
 * Falls back to MongoMemoryServer in development if local MongoDB is not running.
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/startup-crm';

  // Fallback to MongoMemoryServer in development if connecting locally fails
  if (
    process.env.NODE_ENV === 'development' &&
    (uri.includes('127.0.0.1:27017') || uri.includes('localhost:27017'))
  ) {
    try {
      console.log('Checking if local MongoDB is running...');
      // Attempt quick connection check
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 1500, // timeout quickly if not running
      });
      console.log('Connected to local MongoDB database.');
      return;
    } catch (err) {
      console.log('Local MongoDB not running. Spining up in-memory MongoDB Server for development...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
        console.log(`In-memory MongoDB Server running at: ${uri}`);
        
        // Clean up connection states
        await mongoose.disconnect();
      } catch (innerErr) {
        console.error('Failed to start MongoMemoryServer:', innerErr);
        process.exit(1);
      }
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};
