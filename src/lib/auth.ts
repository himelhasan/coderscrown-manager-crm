
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import dbConnect from './db';
import ApiKey from './models/ApiKey';

export async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.split(' ')[1];
  // Basic format check (sk_...)
  if (!token.startsWith('sk_')) return false;

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  
  await dbConnect();
  const key = await ApiKey.findOne({ key_hash: hash, is_active: true });
  
  if (key) {
      // Async update metrics
      const keyId = key.id || key._id;
      if (keyId) {
          ApiKey.findByIdAndUpdate(keyId, { last_used_at: new Date() });
      }
      return true;
  }
  return false;
}
