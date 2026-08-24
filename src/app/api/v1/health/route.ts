import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../../lib/db';

export async function GET(_request: NextRequest) {
  const results: any = {
    mongodb_uri_set: process.env.MONGODB_URI ? true : false,
    node_version: process.version,
    env: process.env.NODE_ENV,
    steps: []
  };

  try {
    results.steps.push('Connecting to MongoDB via Mongoose...');
    await dbConnect();
    
    results.steps.push('Checking connection state...');
    const state = mongoose.connection.readyState;
    const statesMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    results.connection_state = statesMap[state] || 'unknown';
    results.steps.push(`MongoDB connection state: ${results.connection_state}`);
    
    return NextResponse.json(results);
  } catch (error: unknown) {
    results.steps.push('MongoDB test failed.');
    const err = error as any;
    results.error = {
      name: err.name || 'Error',
      message: err.message || String(err)
    };
    
    return NextResponse.json(results, { status: 500 });
  }
}
