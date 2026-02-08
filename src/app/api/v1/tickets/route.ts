
import dbConnect from '@/lib/db';
import '@/lib/models/Project'; // Ensure Project model is registered
import Ticket from '@/lib/models/Ticket';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { firebaseUid, subject, type, description, priority, client_id } = body;

    let targetUser;

    // If client_id is provided (Admin creating for client), find that user
    if (client_id) {
        targetUser = await User.findById(client_id);
    } else if (firebaseUid) {
        // Normal flow
        targetUser = await User.findOne({ firebaseUid });
    }

    if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const ticket = await Ticket.create({
        client: targetUser._id,
        project: body.project,
        subject,
        type,
        description,
        priority,
        messages: [{
            sender: targetUser._id, // Initial message from client (or admin appearing as client/system)
            // Ideally if admin creates, sender should be admin, but for now simplify as "ticket description"
            content: description,
        }]
    });

    return NextResponse.json({ data: ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await Ticket.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');

    if (!firebaseUid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let query: any = {};
    if (user.role === 'client') {
        query.client = user._id;
    }

    // Populate client details for admin view
    console.log('Ticket Query:', JSON.stringify(query, null, 2));
    const tickets = await Ticket.find(query)
        .populate('client', 'displayName email photoURL')
        .populate('project', 'name')
        .sort({ updatedAt: -1 });
    
    console.log(`Found ${tickets.length} tickets`);
    return NextResponse.json({ data: tickets });
  } catch (error: any) {
    console.error('Error in GET /api/v1/tickets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
