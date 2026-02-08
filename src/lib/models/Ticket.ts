
import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  client: mongoose.Types.ObjectId; // Reference to User
  project?: mongoose.Types.ObjectId; // Reference to Project
  subject: string;
  type: 'website_development' | 'maintenance' | 'update' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  messages: {
      sender: mongoose.Types.ObjectId; // User ID
      senderModel: 'User'; // Just for clarity, we only have User model now
      content: string;
      createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  subject: { type: String, required: true },
  type: { 
      type: String, 
      enum: ['website_development', 'maintenance', 'update', 'other'], 
      required: true 
  },
  status: { 
      type: String, 
      enum: ['open', 'in_progress', 'resolved', 'closed'], 
      default: 'open' 
  },
  priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
  },
  description: { type: String },
  messages: [{
      sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Helper to make sure we don't recompile model on hot reload
export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
