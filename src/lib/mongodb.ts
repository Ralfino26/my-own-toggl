import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set in environment variables');
  throw new Error('Please add your Mongo URI to .env.local or .env as MONGODB_URI');
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Use a global variable to store the client promise across hot reloads in development
// and across serverless function invocations in production
let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

let clientPromise: Promise<MongoClient>;

if (!globalWithMongo._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  globalWithMongo._mongoClientPromise = client.connect();
}

clientPromise = globalWithMongo._mongoClientPromise;

export default clientPromise;

