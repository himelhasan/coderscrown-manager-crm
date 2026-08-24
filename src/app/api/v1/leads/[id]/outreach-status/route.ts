import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/db';
import Lead from '../../../../../../lib/models/Lead';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const updateFields: any = {};
    if (body.campaign_name !== undefined) updateFields['cold_outreach.campaign_name'] = body.campaign_name;
    if (body.response_status) updateFields['cold_outreach.response_status'] = body.response_status;
    if (body.next_followup_date) updateFields['cold_outreach.next_followup_date'] = body.next_followup_date;
    if (body.campaign_status) updateFields['cold_outreach.campaign_status'] = body.campaign_status;
    
    if (body.response_status === 'interested') {
        updateFields['status'] = 'qualified';
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
