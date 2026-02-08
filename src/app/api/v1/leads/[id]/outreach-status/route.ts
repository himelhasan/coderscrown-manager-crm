
import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Body: { response_status, next_followup_date, campaign_status }

    const updateFields: any = {};
    if (body.response_status) updateFields['cold_outreach.response_status'] = body.response_status;
    if (body.next_followup_date) updateFields['cold_outreach.next_followup_date'] = body.next_followup_date;
    if (body.campaign_status) updateFields['cold_outreach.campaign_status'] = body.campaign_status;
    
    // Also if response_status is interested, maybe update main status?
    if (body.response_status === 'interested') {
        updateFields['status'] = 'qualified'; // Or 'waiting_response'? Use logic as preferred.
    }

    const lead = await Lead.findByIdAndUpdate(
        id, 
        { $set: updateFields },
        { new: true }
    );

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ data: lead });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
