
import dbConnect from '@/lib/db';
import Project from '@/lib/models/Project';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    // Fetch all projects, you can add filters here if needed (e.g., status='live')
    // For now, returning all projects as requested, or maybe filter by status if common pattern
    // The user said "make sure the projects have a get api link that can be used by other websites."
    // Usually only 'live' projects are public, but let's return all or maybe just 'live' and 'development'?
    // Let's return all for now, but sensitive fields should be managed. 
    // Additional requirement: C-O-R-S. Next.js App Router handles CORS via headers in response or middleware.
    // For a simple route handler, we can set headers.

    const projects = await Project.find({ status: { $ne: 'archived' } }).sort({ createdAt: -1 });

    const response = NextResponse.json({ data: projects });

    // Enable CORS
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
    const response = NextResponse.json({}, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}
