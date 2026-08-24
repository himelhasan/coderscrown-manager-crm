import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Ticket from '../../../../lib/models/Ticket';
import User from '../../../../lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { firebaseUid, subject, type, description, priority, client_id } = body;

    let targetUser;

    if (client_id) {
        targetUser = await User.findById(client_id);
    } else if (firebaseUid) {
        targetUser = await User.findOne({ firebaseUid });
    }

    if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userIdStr = String(targetUser._id || targetUser.id);

    const ticket = await Ticket.create({
        client: userIdStr,
        client_id: userIdStr,
        project: body.project,
        project_id: body.project,
        subject,
        type,
        description,
        priority,
        messages: [{
            sender: userIdStr,
            content: description,
        }]
    });

    return NextResponse.json({ data: ticket }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
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

    const query: any = {};
    if (user.role === 'client') {
        const userIdStr = String(user._id || user.id);
        query.$or = [{ client_id: userIdStr }, { client: userIdStr }];
    }

    const tickets = await Ticket.find(query).sort({ updatedAt: -1 });
    
    console.log(`Found ${tickets.length} tickets`);
    return NextResponse.json({ data: tickets });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in GET /api/v1/tickets:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
