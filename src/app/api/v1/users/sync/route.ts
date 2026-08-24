import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import User from '../../../../../lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { firebaseUid, email, displayName, photoURL, ...profileData } = body;

    console.log('Syncing User:', { firebaseUid, email });

    if (!firebaseUid || !email) {
        return NextResponse.json({ error: `Missing required fields: ${!firebaseUid ? 'uid ' : ''}${!email ? 'email' : ''}` }, { status: 400 });
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
        user = await User.findOne({ email });
    }

    if (user) {
        const updateData = {
            firebaseUid,
            email,
            displayName: displayName || user.displayName,
            photoURL: photoURL || user.photoURL,
            ...profileData
        };
        
        const userId = user._id || user.id;
        if (userId) {
            user = await User.findByIdAndUpdate(userId, updateData, { new: true });
        } else {
            console.error('User found but has no ID for update:', user);
            throw new Error('User has no ID');
        }
    } else {
        user = await User.create({
            firebaseUid,
            email,
            displayName,
            photoURL,
            role: 'client',
            ...profileData
        });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
