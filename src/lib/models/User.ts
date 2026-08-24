import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser {
  id?: string;
  _id?: string;
  firebaseUid: string;
  email: string;
  role: 'admin' | 'moderator' | 'client';
  displayName?: string;
  photoURL?: string;
  company_name?: string;
  phone?: string;
  website?: string;
  address?: string;
  facebook_link?: string;
  linkedin_link?: string;
  instagram_link?: string;
  twitter_link?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends Omit<IUser, 'id' | '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'moderator', 'client'], default: 'client' },
    displayName: { type: String },
    photoURL: { type: String },
    company_name: { type: String },
    phone: { type: String },
    website: { type: String },
    address: { type: String },
    facebook_link: { type: String },
    linkedin_link: { type: String },
    instagram_link: { type: String },
    twitter_link: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
