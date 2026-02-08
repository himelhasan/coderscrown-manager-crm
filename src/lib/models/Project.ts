
import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  status: 'development' | 'live' | 'archived';
  link?: string;
  image_link?: string; // URL to project image
  budget?: number;
  tech_stack?: string[];
  deadline?: Date;
  tags?: string[];
  client_id?: string; // If linked to a client user
  approved: boolean; // Admin approval status
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { 
      type: String, 
      enum: ['development', 'live', 'archived'], 
      default: 'development' 
  },
  link: { type: String },
  image_link: { type: String },
  budget: { type: Number },
  tech_stack: [String],
  deadline: { type: Date },
  tags: [String],
  client_id: { type: String },
  approved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
