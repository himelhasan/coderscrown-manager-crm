import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  status: string;
  link?: string;
  image_link?: string;
  budget?: number;
  tech_stack?: string[];
  deadline?: Date;
  tags?: string[];
  client_id?: string;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProjectDocument extends Omit<IProject, 'id' | '_id'>, Document {}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'pending' },
    link: { type: String },
    image_link: { type: String },
    budget: { type: Number },
    tech_stack: { type: [String], default: [] },
    deadline: { type: Date },
    tags: { type: [String], default: [] },
    client_id: { type: String, index: true },
    approved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Project: Model<IProjectDocument> = mongoose.models.Project || mongoose.model<IProjectDocument>('Project', ProjectSchema);

export default Project;
