import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  description?: string;
  created_by?: string; 
  metrics?: {
    total_leads: number;
    emails_sent: number;
    open_rate: number;
    response_rate: number;
    conversion_rate: number;
  };
}

const CampaignSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  created_by: { type: String },
  metrics: {
    total_leads: { type: Number, default: 0 },
    emails_sent: { type: Number, default: 0 },
    open_rate: { type: Number, default: 0 },
    response_rate: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
