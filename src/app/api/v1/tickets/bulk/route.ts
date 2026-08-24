import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import Ticket from '../../../../../lib/models/Ticket';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { ids, action, updateData } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No ticket IDs provided' }, { status: 400 });
    }

    if (action === 'delete') {
      const result = await Ticket.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ message: `Successfully deleted ${result.deletedCount} tickets` });
    }

    if (action === 'update') {
      if (!updateData || typeof updateData !== 'object') {
        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
      }

      const result = await Ticket.updateMany(
        { _id: { $in: ids } },
        { $set: updateData }
      );

      return NextResponse.json({ message: `Successfully updated ${result.modifiedCount} tickets` });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
