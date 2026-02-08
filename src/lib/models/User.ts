
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  role: 'admin' | 'moderator' | 'client';
  displayName?: string;
  photoURL?: string;
  // Specific fields for Clients
  clientProfile?: {
     company_name?: string;
     phone?: string;
     website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { 
      type: String, 
      enum: ['admin', 'moderator', 'client'], 
      default: 'client' 
  },
  displayName: { type: String },
  photoURL: { type: String },
  
  // Flattened Client Profile Fields
  company_name: String,
  phone: String,
  website: String,
  address: String,
  facebook_link: String,
  linkedin_link: String,
  instagram_link: String,
  twitter_link: String,
  
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
