import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOutreachLog {
  id?: string;
  _id?: string;
  lead_id: string;
  email_subject: string;
  email_body_preview?: string;
  status: 'sent' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'replied';
  outreach_type: 'first_email' | 'follow_up' | 'manual';
  sent_at: Date;
  opened_at?: Date;
  clicked_at?: Date;
  response_received: boolean;
  response_type?: 'interested' | 'not_interested' | 'needs_info' | 'schedule_call';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOutreachLogDocument extends Omit<IOutreachLog, 'id' | '_id'>, Document {}

const OutreachLogSchema = new Schema<IOutreachLogDocument>(
  {
    lead_id: { type: String, required: true, index: true },
    email_subject: { type: String, required: true },
    email_body_preview: { type: String },
    status: {
      type: String,
      enum: ['sent', 'opened', 'clicked', 'bounced', 'unsubscribed', 'replied'],
      default: 'sent',
    },
    outreach_type: {
      type: String,
      enum: ['first_email', 'follow_up', 'manual'],
      default: 'first_email',
    },
    sent_at: { type: Date, default: Date.now },
    opened_at: { type: Date },
    clicked_at: { type: Date },
    response_received: { type: Boolean, default: false },
    response_type: {
      type: String,
      enum: ['interested', 'not_interested', 'needs_info', 'schedule_call'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const OutreachLog: Model<IOutreachLogDocument> =
  mongoose.models.OutreachLog || mongoose.model<IOutreachLogDocument>('OutreachLog', OutreachLogSchema);

export default OutreachLog;
