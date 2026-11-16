import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: string;
  name: string;
  description?: string;
  targetLanguage: 'hi' | 'en' | 'hi-en';
  guidelinesProfile: 'hindi_hi_IN' | 'general';
  audioFilesCount: number;
  totalDurationSeconds: number;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  targetLanguage: { type: String, enum: ['hi', 'en', 'hi-en'], default: 'hi-en' },
  guidelinesProfile: { type: String, enum: ['hindi_hi_IN', 'general'], default: 'hindi_hi_IN' },
  audioFilesCount: { type: Number, default: 0 },
  totalDurationSeconds: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
}, {
  timestamps: true
});

export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);
