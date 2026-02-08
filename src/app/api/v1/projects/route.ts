
import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    // Fetch all for now. Frontend will filter 'approved' for public view, 
    // but Admin needs to see all. 
    // Ideally we filter based on auth, but for MVP let's return all and filter in UI component 
    // or add a query param '?approved=true'
    const { searchParams } = new URL(request.url);
    const approvedOnly = searchParams.get('approved') === 'true';

    const query: any = {};
    if (approvedOnly) {
        query.approved = true;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ data: projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log('API Received Body:', JSON.stringify(body, null, 2));
    
    // Explicitly set approved to false unless it's an admin (to be implemented), 
    // for now default is false via schema but let's be explicit if we want logic here.
    // Also ensuring client_id is saved if passed.
    
    // We can also check headers for user context if we want to enforce client_id from token
    const uid = request.headers.get('X-User-UID');
    if (uid) {
        body.client_id = uid;
    }

    const project = await Project.create(body);
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { _id, ...updateData } = body;

        // Simple update for now
        const project = await Project.findByIdAndUpdate(_id, updateData, { new: true });
        
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ data: project });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
             return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        await Project.findByIdAndDelete(id);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
