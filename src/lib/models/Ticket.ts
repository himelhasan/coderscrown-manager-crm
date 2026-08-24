import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicketMessage {
  _id?: string;
  sender: string;
  sender_id?: string;
  content: string;
  createdAt?: Date;
}

export interface ITicket {
  id?: string;
  _id?: string;
  client_id?: string;
  client?: string;
  project_id?: string;
  project?: string;
  subject: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  messages?: ITicketMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITicketDocument extends Omit<ITicket, 'id' | '_id'>, Document {}

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    sender: { type: String, required: true },
    sender_id: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const TicketSchema = new Schema<ITicketDocument>(
  {
    client_id: { type: String, index: true },
    client: { type: String },
    project_id: { type: String },
    project: { type: String },
    subject: { type: String, required: true },
    type: { type: String, default: 'support' },
    status: { type: String, default: 'open' },
    priority: { type: String, default: 'medium' },
    description: { type: String, required: true },
    messages: { type: [TicketMessageSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Ticket: Model<ITicketDocument> = mongoose.models.Ticket || mongoose.model<ITicketDocument>('Ticket', TicketSchema);

export default Ticket;
