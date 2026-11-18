import mongoose, { Schema, Document } from 'mongoose';
import { LanguageCode, GuidelinesProfile } from '../shared/types';

export interface IProject extends Document {
  userId: string;
  name: string;
  description?: string;
  targetLanguage: LanguageCode;
  guidelinesProfile: GuidelinesProfile;
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
  targetLanguage: { 
    type: String, 
    enum: [
      'hi', 'en', 'hi-en', 'bn', 'ta', 'te', 'mr', 'gu',
      'kn', 'ml', 'pa', 'or', 'ur', 'as', 'es', 'fr', 'de', 'ar', 'multilingual'
    ], 
    default: 'hi-en' 
  },
  guidelinesProfile: { 
    type: String, 
    enum: ['hindi_hi_IN', 'indic_multilingual', 'general'], 
    default: 'indic_multilingual' 
  },
  audioFilesCount: { type: Number, default: 0 },
  totalDurationSeconds: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'archived'], default: 'active' }
}, {
  timestamps: true
});

export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);
