import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

// Ensure SRV records for MongoDB Atlas resolve reliably across all ISPs/local DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // If system restricts custom DNS servers, fallback gracefully
}

export async function connectDatabase() {
  if (!env.MONGODB_URI) {
    const err = new Error('FATAL: MONGODB_URI is not set in environment configuration.');
    console.error(err.message);
    throw err;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Atlas Connected: host=${conn.connection.host}, db=${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB Atlas: ${error.message}`);
    throw error;
  }
}
