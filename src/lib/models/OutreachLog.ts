import mongoose, { Document, Schema } from 'mongoose';

export interface IOutreachLog extends Document {
  lead_id: mongoose.Types.ObjectId;
  email_subject: string;
  email_body_preview?: string;
  status: 'sent' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  outreach_type: 'first_email' | 'follow_up' | 'manual';
  sent_at: Date;
  opened_at?: Date;
  clicked_at?: Date;
  response_received: boolean;
  response_type?: 'interested' | 'not_interested' | 'needs_info' | 'schedule_call';
}

const OutreachLogSchema: Schema = new Schema({
  lead_id: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  email_subject: { type: String, required: true },
  email_body_preview: { type: String },
  status: { type: String, enum: ['sent', 'opened', 'clicked', 'bounced', 'unsubscribed'], required: true },
  outreach_type: { type: String, enum: ['first_email', 'follow_up', 'manual'], required: true },
  sent_at: { type: Date, default: Date.now },
  opened_at: { type: Date },
  clicked_at: { type: Date },
  response_received: { type: Boolean, default: false },
  response_type: { type: String, enum: ['interested', 'not_interested', 'needs_info', 'schedule_call'] }
}, { timestamps: true });

export default mongoose.models.OutreachLog || mongoose.model<IOutreachLog>('OutreachLog', OutreachLogSchema);
