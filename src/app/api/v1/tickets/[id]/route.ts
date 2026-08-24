import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import Ticket from '../../../../../lib/models/Ticket';
import User from '../../../../../lib/models/User';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    return NextResponse.json({ data: ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { firebaseUid, content, status } = body;

    const user = await User.findOne({ firebaseUid });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const update: any = {};
    
    if (content) {
        update.$push = {
            messages: {
                sender: String(user._id || user.id),
                content,
                createdAt: new Date()
            }
        };
    }

    if (status) {
        update.status = status;
    }

    const ticket = await Ticket.findByIdAndUpdate(id, update, { new: true });

    return NextResponse.json({ data: ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
