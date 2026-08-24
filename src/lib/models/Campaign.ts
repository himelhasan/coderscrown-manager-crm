import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICampaignMetrics {
  total_leads?: number;
  emails_sent?: number;
  open_rate?: number;
  response_rate?: number;
  conversion_rate?: number;
  interested_leads?: number;
  qualified_leads?: number;
  positive_response_rate?: number;
}

export interface ICampaign {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  target_audience?: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  created_by?: string;
  metrics?: ICampaignMetrics;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICampaignDocument extends Omit<ICampaign, 'id' | '_id'>, Document {}

const CampaignMetricsSchema = new Schema<ICampaignMetrics>(
  {
    total_leads: { type: Number, default: 0 },
    emails_sent: { type: Number, default: 0 },
    open_rate: { type: Number, default: 0 },
    response_rate: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 },
    interested_leads: { type: Number, default: 0 },
    qualified_leads: { type: Number, default: 0 },
    positive_response_rate: { type: Number, default: 0 },
  },
  { _id: false }
);

const CampaignSchema = new Schema<ICampaignDocument>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    target_audience: { type: String },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'draft'],
      default: 'active',
      index: true,
    },
    created_by: { type: String },
    metrics: { type: CampaignMetricsSchema, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Campaign: Model<ICampaignDocument> = mongoose.models.Campaign || mongoose.model<ICampaignDocument>('Campaign', CampaignSchema);

export default Campaign;
