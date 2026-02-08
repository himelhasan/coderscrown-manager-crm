
import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Body: { followup_date, followup_interval, campaign_name }

    const updateFields: any = {};
    if (body.followup_date) updateFields['cold_outreach.next_followup_date'] = body.followup_date;
    if (body.followup_interval) updateFields['cold_outreach.followup_interval'] = body.followup_interval;
    if (body.campaign_name) updateFields['cold_outreach.campaign_name'] = body.campaign_name;
    
    // Increment sequence? optional
    if (body.increment_sequence) {
         updateFields['cold_outreach.followup_sequence_number'] = 1; // Logic to increment needs $inc, mixing $set and $inc is fine
    }

    const lead = await Lead.findByIdAndUpdate(
        id, 
        { 
            $set: updateFields,
            ...(body.increment_sequence ? { $inc: { 'cold_outreach.followup_sequence_number': 1 } } : {})
        },
        { new: true }
    );

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ data: lead, message: 'Follow-up scheduled' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
