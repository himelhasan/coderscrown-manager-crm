import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../lib/models/User';

const verifyAdmin = async (_req: NextRequest) => {
    return true; 
};

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const users = await User.find();
    return NextResponse.json({ data: users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const { userId, role } = body;

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    return NextResponse.json({ data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
