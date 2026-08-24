import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import Campaign from '../../../../../lib/models/Campaign';
import Lead from '../../../../../lib/models/Lead';
import OutreachLog from '../../../../../lib/models/OutreachLog';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const campaignObj = campaign.toObject();

    // Fetch assigned leads
    const leads = await Lead.find({ 'cold_outreach.campaign_name': campaign.name }).sort({ updatedAt: -1 });
    const leadIds = leads.map(l => String(l._id));

    // Fetch outreach logs for leads in this campaign
    const logs = await OutreachLog.find({ lead_id: { $in: leadIds } }).sort({ sent_at: -1 }).limit(100);

    // Compute dynamic metrics
    const totalLeads = leads.length;
    const emailsSent = logs.length;
    const opens = logs.filter(l => l.status === 'opened').length;
    const replies = logs.filter(l => l.status === 'replied').length;
    const interestedLeads = leads.filter(l => l.cold_outreach?.response_status === 'interested' || l.status === 'qualified' || l.status === 'converted').length;
    const qualifiedLeads = leads.filter(l => l.status === 'qualified' || l.status === 'converted').length;

    campaignObj.metrics = {
      total_leads: totalLeads,
      emails_sent: emailsSent,
      open_rate: emailsSent > 0 ? Math.round((opens / emailsSent) * 100) : 0,
      response_rate: emailsSent > 0 ? Math.round((replies / emailsSent) * 100) : 0,
      conversion_rate: totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0,
      interested_leads: interestedLeads,
      qualified_leads: qualifiedLeads,
      positive_response_rate: totalLeads > 0 ? Math.round((interestedLeads / totalLeads) * 100) : 0,
    };

    return NextResponse.json({
      data: campaignObj,
      leads,
      logs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    const campaign = await Campaign.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        target_audience: body.target_audience,
        status: body.status
      },
      { new: true }
    );

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ data: campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
