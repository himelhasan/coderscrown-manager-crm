import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Project from '../../../../lib/models/Project';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const approvedOnly = searchParams.get('approved') === 'true';

    const query: any = { status: { $ne: 'archived' } };
    if (approvedOnly) {
        query.approved = true;
    }

    const projects = await Project.find(query);
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
        const { _id, id, ...updateData } = body;
        const targetId = _id || id;

        const project = await Project.findByIdAndUpdate(targetId, updateData, { new: true });
        
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
