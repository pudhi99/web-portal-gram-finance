import { MongoClient, MongoClientOptions } from 'mongodb'

const uri = process.env.DATABASE_URL as string
// dbName should be in the connection string for MongoClient, but we can keep these options
const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env.local')
}

// In the native MongoDB driver, the database name is usually part of the URI.
// Mongoose is more flexible and allows a separate dbName option.
// Since we are using one URI, we'll assume it's correctly formed for both.
// If issues persist, ensure your DATABASE_URL includes the database name like:
// mongodb+srv://.../<db-name>?...

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise 