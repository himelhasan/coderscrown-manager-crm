
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let uri = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.+)/);
    if (match) {
        uri = match[1].trim();
    }
}

if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

// Inline Schema
const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { 
      type: String, 
      enum: ['admin', 'moderator', 'client'], 
      default: 'client' 
  },
  displayName: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        
        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.email} (${u.role}) [ID: ${u._id}]`);
        });

        if (users.length === 0) {
            console.log('No users found. Please sign up via the app first.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
