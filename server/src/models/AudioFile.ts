import mongoose, { Schema, Document } from 'mongoose';

export interface IWordSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  speaker: string;
  confidence?: number;
  language?: 'hi' | 'en' | 'hi-en';
  reviewStatus: 'unreviewed' | 'verified' | 'flagged' | 'needs_resegmentation';
  isHesitation?: boolean;
  isUnintelligible?: boolean;
  isCutOff?: boolean;
  isPlausibleGuess?: boolean;
  validationIssues?: any[];
}

export interface IAudioFile extends Document {
  projectId: string;
  userId: string;
  filename: string;
  originalName: string;
  storagePath: string;
  url: string;
  metadata: {
    duration: number;
    sampleRate: number;
    channels: number;
    format: string;
    fileSize: number;
    bitrate?: number;
  };
  status: 'pending' | 'queued' | 'uploading' | 'transcribing' | 'aligning' | 'diarizing' | 'validating' | 'completed' | 'failed';
  processingProgress: number;
  processingStep?: string;
  errorMessage?: string;
  segments: IWordSegment[];
  speakers: string[];
  languageDetected?: 'hi' | 'en' | 'hi-en';
  isSynthetic?: boolean;
  isDistorted?: boolean;
  hasPii?: boolean;
  qualityScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const WordSegmentSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  speaker: { type: String, default: 'Speaker 1' },
  confidence: { type: Number, default: 0.95 },
  language: { type: String, enum: ['hi', 'en', 'hi-en'], default: 'hi' },
  reviewStatus: { 
    type: String, 
    enum: ['unreviewed', 'verified', 'flagged', 'needs_resegmentation'], 
    default: 'unreviewed' 
  },
  isHesitation: { type: Boolean, default: false },
  isUnintelligible: { type: Boolean, default: false },
  isCutOff: { type: Boolean, default: false },
  isPlausibleGuess: { type: Boolean, default: false },
  validationIssues: { type: Array, default: [] }
}, { _id: false });

const AudioFileSchema = new Schema<IAudioFile>({
  projectId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  storagePath: { type: String, required: true },
  url: { type: String, required: true },
  metadata: {
    duration: { type: Number, default: 0 },
    sampleRate: { type: Number, default: 16000 },
    channels: { type: Number, default: 1 },
    format: { type: String, default: 'wav' },
    fileSize: { type: Number, default: 0 },
    bitrate: { type: Number }
  },
  status: { 
    type: String, 
    enum: ['pending', 'queued', 'uploading', 'transcribing', 'aligning', 'diarizing', 'validating', 'completed', 'failed'], 
    default: 'pending' 
  },
  processingProgress: { type: Number, default: 0 },
  processingStep: { type: String, default: 'Ready to process' },
  errorMessage: { type: String },
  segments: [WordSegmentSchema],
  speakers: [{ type: String }],
  languageDetected: { type: String, enum: ['hi', 'en', 'hi-en'], default: 'hi-en' },
  isSynthetic: { type: Boolean, default: false },
  isDistorted: { type: Boolean, default: false },
  hasPii: { type: Boolean, default: false },
  qualityScore: { type: Number, default: 100 }
}, {
  timestamps: true
});

export const AudioFileModel = mongoose.model<IAudioFile>('AudioFile', AudioFileSchema);
