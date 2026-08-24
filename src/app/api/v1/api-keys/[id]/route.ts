
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import ApiKey from '../../../../../lib/models/ApiKey';

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    await ApiKey.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Key revoked' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
