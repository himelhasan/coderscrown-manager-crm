const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

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

if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

if (uri.endsWith('.net/')) {
    uri = uri + 'CODERSCROWN-CRM';
}

async function run() {
    try {
        console.log('Connecting to MongoDB database CODERSCROWN-CRM...');
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB successfully!');
        
        const UserCollection = mongoose.connection.db.collection('users');
        
        const targetEmail = 'himelhasandev@gmail.com';
        
        const existing = await UserCollection.findOne({ email: targetEmail });
        if (existing) {
            const updateRes = await UserCollection.updateOne(
                { email: targetEmail },
                { $set: { role: 'admin' } }
            );
            console.log(`✅ Updated existing user (${targetEmail}) role to admin:`, updateRes);
        } else {
            const insertRes = await UserCollection.insertOne({
                email: targetEmail,
                firebaseUid: 'admin-himelhasandev-uid',
                role: 'admin',
                displayName: 'Himel Hasan (Super Admin)',
                company_name: 'CodersCrown Manager',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`✅ Created Super Admin document for ${targetEmail}:`, insertRes);
        }
        
        const admins = await UserCollection.find({ role: 'admin' }).toArray();
        console.log('\n👑 Current Super Users (Admins) in CODERSCROWN-CRM database:');
        admins.forEach(a => {
            console.log(` - Email: ${a.email} | Role: ${a.role} | ID: ${a._id}`);
        });

    } catch (e) {
        console.error('❌ Error executing admin assignment:', e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
