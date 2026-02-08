
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
let uri = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.+)/);
    if (match) {
        uri = match[1].trim();
    }
}

async function run() {
    try {
        await mongoose.connect(uri);
        const User = mongoose.connection.db.collection('users');
        const result = await User.updateOne(
            { email: 'himelhasan497@gmail.com' }, 
            { $set: { role: 'admin' } }
        );
        console.log('Promotion result:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
