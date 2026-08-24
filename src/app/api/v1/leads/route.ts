import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Lead from '../../../../lib/models/Lead';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const campaign = searchParams.get('campaign');
    const industry = searchParams.get('industry');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (campaign) {
      query['cold_outreach.campaign_name'] = campaign;
    }

    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company_name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
      ];
    }

    const sortConfig: any = {};
    sortConfig[sortBy] = sortOrder;

    const leads = await Lead.find(query).sort(sortConfig).skip(offset).limit(limit);
    const total = await Lead.countDocuments(query);

    return NextResponse.json({
      data: leads,
      meta: {
        total,
        limit,
        offset
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (Array.isArray(body)) {
       const createdLeads = await Lead.insertMany(body);
       return NextResponse.json({ data: createdLeads }, { status: 201 });
    }

    const lead = await Lead.create(body);
    return NextResponse.json({ data: lead }, { status: 201 });

  } catch (error: unknown) {
    const err = error as any;
    if (err.code === 11000 || err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    const message = err.message || String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
