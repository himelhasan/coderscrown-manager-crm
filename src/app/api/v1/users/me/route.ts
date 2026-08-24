import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import User from '../../../../../lib/models/User';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const uid = request.headers.get('X-User-UID');
        const hasAuth = !!request.headers.get('Authorization');
        
        console.log('Diagnostic - Headers:', {
            'x-user-uid': uid ? 'PRESENT' : 'MISSING',
            'authorization': hasAuth ? 'PRESENT' : 'MISSING',
            'user-agent': request.headers.get('user-agent')
        });

        if (!uid) {
             return NextResponse.json({ 
                 error: 'Missing X-User-UID Header',
                 details: 'Header required for authentication context.'
             }, { status: 401 });
        }

        await dbConnect();
        console.log('Diagnostic - DB Connected, searching for UID:', uid);
        const user = await User.findOne({ firebaseUid: uid });
        
        if (!user) {
            console.log('Diagnostic - User NOT found in DB for UID:', uid);
            return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
        }

        console.log('Diagnostic - User found:', user.email);
        return NextResponse.json({ user });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const uid = request.headers.get('X-User-UID');
        if (!uid) {
             return NextResponse.json({ error: 'Missing X-User-UID Header' }, { status: 401 });
        }

        await dbConnect();
        
        const body = await request.json();
        
        delete body._id;
        delete body.firebaseUid;
        delete body.role;
        delete body.createdAt;
        delete body.updatedAt;

        const updatedUser = await User.findOneAndUpdate(
            { firebaseUid: uid },
            body,
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: updatedUser });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
