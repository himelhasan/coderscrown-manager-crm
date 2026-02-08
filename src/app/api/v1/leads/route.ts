
import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company_name: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await Lead.countDocuments(query);

    return NextResponse.json({
      data: leads,
      meta: {
        total,
        limit,
        offset
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Basic validation could go here, but Mongoose will error if required fields are missing
    
    // Handle bulk creation if body is array
    if (Array.isArray(body)) {
       const createdLeads = await Lead.insertMany(body);
       return NextResponse.json({ data: createdLeads }, { status: 201 });
    }

    const lead = await Lead.create(body);
    return NextResponse.json({ data: lead }, { status: 201 });

  } catch (error: any) {
    // Duplicate key error
    if (error.code === 11000) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
