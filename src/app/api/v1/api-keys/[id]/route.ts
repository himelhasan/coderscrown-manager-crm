
import dbConnect from '@/lib/db';
import ApiKey from '@/lib/models/ApiKey';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    await ApiKey.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Key revoked' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
