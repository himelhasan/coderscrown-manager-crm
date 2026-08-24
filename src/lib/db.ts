import dns from 'dns';
import mongoose from 'mongoose';

// Fix querySrv ECONNREFUSED on networks/OS where default local DNS blocks SRV lookups
try {
  if (dns.setServers) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (err) {
  console.warn('DNS configuration warning:', err);
}

let MONGODB_URI = process.env.MONGODB_URI || '';

if (MONGODB_URI && MONGODB_URI.endsWith('.net/')) {
  MONGODB_URI = MONGODB_URI + 'CODERSCROWN-CRM';
}

/**
 * Global is used here to maintain a cached connection across hot reloads in development
 * and serverless function invocations on Vercel.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local or Vercel environment variables');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ Connected to MongoDB via Mongoose');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
