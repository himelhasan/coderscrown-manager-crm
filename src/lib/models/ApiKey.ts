import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKey extends Document {
  user_id?: string;
  key_hash: string;
  name: string;
  last_used_at?: Date;
  is_active: boolean;
}

const ApiKeySchema: Schema = new Schema({
  user_id: { type: String }, 
  key_hash: { type: String, required: true },
  name: { type: String, required: true },
  last_used_at: { type: Date },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
