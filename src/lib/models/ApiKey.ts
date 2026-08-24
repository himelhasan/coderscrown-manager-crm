import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApiKey {
  id?: string;
  _id?: string;
  user_id?: string;
  key_hash: string;
  name: string;
  last_used_at?: Date;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IApiKeyDocument extends Omit<IApiKey, 'id' | '_id'>, Document {}

const ApiKeySchema = new Schema<IApiKeyDocument>(
  {
    user_id: { type: String },
    key_hash: { type: String, required: true, index: true },
    name: { type: String, required: true },
    last_used_at: { type: Date },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const ApiKey: Model<IApiKeyDocument> = mongoose.models.ApiKey || mongoose.model<IApiKeyDocument>('ApiKey', ApiKeySchema);

export default ApiKey;
