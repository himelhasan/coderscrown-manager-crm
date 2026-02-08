import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  facebook_link?: string; // Keep for backward compatibility or map to personal/page
  fb_personal_link?: string;
  fb_page_link?: string;
  instagram_link?: string;
  linkedin_link?: string;
  linkedin_company?: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  position?: string;
  best_contact_time?: string;
  source?: string;
  status: 'new' | 'in_progress' | 'contacted' | 'waiting_response' | 'qualified' | 'not_interested' | 'converted';
  tags: string[];
  notes?: string;
  cold_outreach?: {
    first_email_sent_date?: Date;
    next_followup_date?: Date;
    followup_interval?: '3_days' | '7_days' | '14_days' | '30_days' | 'custom';
    followup_sequence_number?: number;
    campaign_name?: string;
    campaign_status?: 'active' | 'paused' | 'completed' | 'failed';
    response_status?: 'no_response' | 'interested' | 'not_interested' | 'needs_info' | 'schedule_call';
    last_followup_sent_date?: Date;
    automated_followups_scheduled?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  facebook_link: { type: String },
  fb_personal_link: { type: String },
  fb_page_link: { type: String },
  instagram_link: { type: String },
  linkedin_link: { type: String },
  linkedin_company: { type: String },
  company_name: { type: String },
  industry: { type: String },
  company_size: { type: String },
  position: { type: String },
  best_contact_time: { type: String },
  source: { type: String },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'contacted', 'waiting_response', 'qualified', 'not_interested', 'converted'],
    default: 'new'
  },
  tags: [String],
  notes: { type: String },
  cold_outreach: {
    first_email_sent_date: { type: Date },
    next_followup_date: { type: Date },
    followup_interval: { type: String },
    followup_sequence_number: { type: Number, default: 0 },
    campaign_name: { type: String },
    campaign_status: { type: String, enum: ['active', 'paused', 'completed', 'failed'], default: 'active' },
    response_status: { type: String, enum: ['no_response', 'interested', 'not_interested', 'needs_info', 'schedule_call'], default: 'no_response' },
    last_followup_sent_date: { type: Date },
    automated_followups_scheduled: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Prevent overwrite on HMR
export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
