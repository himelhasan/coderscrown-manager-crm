
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('URI:', MONGODB_URI ? 'Defined (hidden for safety)' : 'NOT DEFINED');
  
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  try {
    console.log('Attempting to connect...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    console.log('✅ Connection successful!');
    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n--- Diagnosis ---');
      console.log('This error usually means the driver cannot reach any servers.');
      console.log('Possible reasons:');
      console.log('1. IP Whitelist: You said you added 0.0.0.0/0, but double check if it is active.');
      console.log('2. Firewall: Port 27017 (for MongoDB) might be blocked by your network or hosting provider (cPanel/VPS).');
      console.log('3. DNS: The "mongodb+srv" format uses DNS SRV records. Some DNS servers have trouble resolving these.');
      console.log('4. URI: Check for any typos in the connection string.');
    }
  }
}

testConnection();
