
import dbConnect from '@/lib/db';
import Campaign from '@/lib/models/Campaign';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const campaign = await Campaign.create(body);
    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
        return NextResponse.json({ error: 'Campaign name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
