// NOTE: You must install 'mongoose' for this file to work: npm install mongoose
import mongoose from 'mongoose'
// Import models registry to ensure all models are registered
import '@/lib/models'

type ConnectionObject = {
  isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
  // Check if we already have a connection
  if (connection.isConnected === 1) {
    console.log('Using existing database connection');
    return;
  }

  // Check if we're in the process of connecting
  if (connection.isConnected === 2) {
    console.log('Database connection in progress, waiting...');
    // Wait for connection to complete
    while (connection.isConnected === 2) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  try {
    console.log('Connecting to database...');
    connection.isConnected = 2; // Mark as connecting

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const db = await mongoose.connect(dbUrl, {
      dbName: process.env.MONGODB_DB || 'GramFinance',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('Database connected successfully');
  } catch (error) {
    connection.isConnected = 0;
    console.error('Database connection failed:', error);
    throw error;
  }
}

export default dbConnect 