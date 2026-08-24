
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import ApiKey from '../../../../lib/models/ApiKey';

export async function GET() {
  try {
    await dbConnect();
    // Return all keys for now (Admin view), typically filter by user
    const keys = await ApiKey.find();
    
    // Mask items? user might want to see name and prefix
    // The hash is secure, but we shouldn't return it either usually, but it's a hash.
    // Let's return the document as is (it only has hash).
    return NextResponse.json({ data: keys });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(_id_request_unused: NextRequest) {
  try {
    await dbConnect();
    const body = await _id_request_unused.json();
    
    // Generate Key
    const rawKey = 'sk_' + crypto.randomBytes(24).toString('hex');
    
    // Hash it? Simple usage: store direct hash (sha256)
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await ApiKey.create({
        name: body.name || 'Untitled Key',
        key_hash: hash,
        user_id: body.user_id,
        is_active: true
    });

    // Return the RAW key only once
    return NextResponse.json({ 
        data: apiKey,
        secret_key: rawKey // User must save this
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
