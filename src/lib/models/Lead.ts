import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IColdOutreach {
  first_email_sent_date?: Date;
  last_outreach_date?: Date;
  next_followup_date?: Date;
  followup_interval?: string;
  followup_sequence_number?: number;
  campaign_name?: string;
  campaign_status?: string;
  response_status?: string;
  last_followup_sent_date?: Date;
  automated_followups_scheduled?: number;
}

export interface ILead {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  facebook_link?: string;
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
  cold_outreach?: IColdOutreach;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILeadDocument extends Omit<ILead, 'id' | '_id'>, Document {}

const ColdOutreachSchema = new Schema<IColdOutreach>(
  {
    first_email_sent_date: { type: Date },
    last_outreach_date: { type: Date },
    next_followup_date: { type: Date },
    followup_interval: { type: String },
    followup_sequence_number: { type: Number, default: 0 },
    campaign_name: { type: String },
    campaign_status: { type: String },
    response_status: { type: String },
    last_followup_sent_date: { type: Date },
    automated_followups_scheduled: { type: Number, default: 0 },
  },
  { _id: false }
);

const LeadSchema = new Schema<ILeadDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
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
      default: 'new',
      index: true,
    },
    tags: { type: [String], default: [] },
    notes: { type: String },
    cold_outreach: { type: ColdOutreachSchema, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Lead: Model<ILeadDocument> = mongoose.models.Lead || mongoose.model<ILeadDocument>('Lead', LeadSchema);

export default Lead;
