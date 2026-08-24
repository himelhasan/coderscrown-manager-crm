
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/db';
import Lead from '../../../../../../lib/models/Lead';
import OutreachLog from '../../../../../../lib/models/OutreachLog';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const logs = await OutreachLog.find({ lead_id: id });

    return NextResponse.json({ data: logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Validate Lead exists
    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Create Log
    const log = await OutreachLog.create({
      lead_id: id,
      outreach_type: body.outreach_type || 'email', // email, call, linkedin
      status: body.status || 'sent', // sent, opened, replied, etc.
      email_subject: body.email_subject || 'No Subject',
      email_body_preview: body.email_body_preview,
      sent_at: body.sent_at || new Date(),
      metadata: body.metadata || {}
    });

    // Update Lead's last outreach date and status
    const updateData: any = {
      'cold_outreach.last_outreach_date': new Date(),
    };

    // If this is the FIRST email sent, initialize the campaign status
    if (!lead.cold_outreach?.first_email_sent_date && body.status === 'sent') {
         updateData['cold_outreach.first_email_sent_date'] = new Date();
         updateData['cold_outreach.campaign_status'] = 'active';
         updateData['status'] = 'in_progress';
    }

    // If the lead replied, change status to warm
    if (body.status === 'replied') {
      updateData.status = 'warm_lead';
      updateData['cold_outreach.response_status'] = 'interested'; 
    }

    await Lead.findByIdAndUpdate(id, { $set: updateData });

    return NextResponse.json({ data: log }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
