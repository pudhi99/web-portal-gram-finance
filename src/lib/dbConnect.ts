// NOTE: You must install 'mongoose' for this file to work: npm install mongoose
import mongoose from 'mongoose'

type ConnectionObject = {
  isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    return
  }

  try {
    const db = await mongoose.connect(process.env.DATABASE_URL || '', {
      dbName: process.env.MONGODB_DB || 'GramFinance',
      bufferCommands: false,
    })

    connection.isConnected = db.connections[0].readyState
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

export default dbConnect 