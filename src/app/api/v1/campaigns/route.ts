import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Campaign from '../../../../lib/models/Campaign';
import Lead from '../../../../lib/models/Lead';
import OutreachLog from '../../../../lib/models/OutreachLog';

export async function GET() {
  try {
    await dbConnect();
    const rawCampaigns = await Campaign.find().sort({ createdAt: -1 });

    // Dynamically calculate real-time analytics for each campaign
    const campaignsWithAnalytics = await Promise.all(
      rawCampaigns.map(async (c) => {
        const campaignObj = c.toObject();
        const campaignName = c.name;

        // Fetch assigned leads count
        const totalLeads = await Lead.countDocuments({ 'cold_outreach.campaign_name': campaignName });

        // Fetch lead IDs for outreach log querying
        const leads = await Lead.find({ 'cold_outreach.campaign_name': campaignName }, { _id: 1, status: 1, cold_outreach: 1 });
        const leadIds = leads.map(l => String(l._id));

        // Count outreach logs
        const emailsSent = await OutreachLog.countDocuments({ lead_id: { $in: leadIds } });
        const opens = await OutreachLog.countDocuments({ lead_id: { $in: leadIds }, status: 'opened' });
        const replies = await OutreachLog.countDocuments({ lead_id: { $in: leadIds }, status: 'replied' });

        // Count response states from leads
        const interestedLeads = leads.filter(l => l.cold_outreach?.response_status === 'interested' || l.status === 'qualified' || l.status === 'converted').length;
        const qualifiedLeads = leads.filter(l => l.status === 'qualified' || l.status === 'converted').length;

        // Compute rates
        const openRate = emailsSent > 0 ? Math.round((opens / emailsSent) * 100) : (campaignObj.metrics?.open_rate || 0);
        const responseRate = emailsSent > 0 ? Math.round((replies / emailsSent) * 100) : (campaignObj.metrics?.response_rate || 0);
        const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : (campaignObj.metrics?.conversion_rate || 0);

        campaignObj.metrics = {
          total_leads: totalLeads || campaignObj.metrics?.total_leads || 0,
          emails_sent: emailsSent || campaignObj.metrics?.emails_sent || 0,
          open_rate: openRate,
          response_rate: responseRate,
          conversion_rate: conversionRate,
          interested_leads: interestedLeads,
          qualified_leads: qualifiedLeads,
          positive_response_rate: totalLeads > 0 ? Math.round((interestedLeads / totalLeads) * 100) : 0,
        };

        return campaignObj;
      })
    );

    return NextResponse.json({ data: campaignsWithAnalytics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const campaign = await Campaign.create({
      name: body.name,
      description: body.description,
      target_audience: body.target_audience,
      status: body.status || 'active',
      created_by: body.created_by || null,
      metrics: {
        total_leads: 0,
        emails_sent: 0,
        open_rate: 0,
        response_rate: 0,
        conversion_rate: 0,
        interested_leads: 0,
        qualified_leads: 0,
        positive_response_rate: 0,
      }
    });
    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000 || error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return NextResponse.json({ error: 'Campaign name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
