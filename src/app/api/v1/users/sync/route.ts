
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { firebaseUid, email, displayName, photoURL, ...profileData } = body;

    console.log('Syncing User:', { firebaseUid, email });

    if (!firebaseUid || !email) {
        return NextResponse.json({ error: `Missing required fields: ${!firebaseUid ? 'uid ' : ''}${!email ? 'email' : ''}` }, { status: 400 });
    }

    // Update or Create User
    // We search by firebaseUid first. If not found, we fallback to email to support 
    // linking existing records (e.g. from previous manual entries or old schema).
    let user = await User.findOne({ firebaseUid });

    if (!user) {
        // Fallback: check by email
        user = await User.findOne({ email });
    }

    if (user) {
        // Update existing user
        user.firebaseUid = firebaseUid;
        user.email = email;
        user.displayName = displayName || user.displayName;
        user.photoURL = photoURL || user.photoURL;
        
        // Merge profile data
        Object.assign(user, profileData);
        await user.save();
    } else {
        // Create new user
        user = await User.create({
            firebaseUid,
            email,
            displayName,
            photoURL,
            role: 'client', // Default role for new users
            ...profileData
        });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
