/**
 * VoxAlign Shared Type Definitions
 * Used across Frontend, Backend and AI Service integration
 */

export type Role = 'user' | 'admin' | 'reviewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  organization?: string;
  quotaMinutes: number;
  usedMinutes: number;
  createdAt: string;
}

export type TaskStatus = 
  | 'pending'
  | 'queued'
  | 'uploading'
  | 'transcribing'
  | 'aligning'
  | 'diarizing'
  | 'validating'
  | 'completed'
  | 'failed';

export type SegmentReviewStatus = 
  | 'unreviewed'
  | 'verified'
  | 'flagged'
  | 'needs_resegmentation';

export type LanguageCode = 'hi' | 'en' | 'hi-en'; // Hindi, English, Hinglish

export interface WordSegment {
  id: string;
  text: string;
  start: number; // in seconds, high precision
  end: number;   // in seconds, high precision
  speaker: string; // e.g. "Speaker 1" or "spk_1"
  confidence?: number; // 0.0 to 1.0
  language?: LanguageCode;
  reviewStatus: SegmentReviewStatus;
  isHesitation?: boolean;
  isUnintelligible?: boolean;
  isCutOff?: boolean;
  isPlausibleGuess?: boolean;
  validationIssues?: ValidationIssue[];
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  code: string;
  message: string;
  severity: ValidationSeverity;
  ruleCategory: 
    | 'segmentation'
    | 'script'
    | 'spelling'
    | 'timestamp'
    | 'overlap'
    | 'guideline_compliance'
    | 'pii'
    | 'audio_condition';
  suggestedFix?: string;
}

export interface AudioMetadata {
  duration: number; // in seconds
  sampleRate: number; // in Hz (e.g. 16000, 44100)
  channels: number;   // 1 (mono) or 2 (stereo)
  format: string;     // mp3, wav, m4a, flac
  fileSize: number;   // in bytes
  bitrate?: number;
}

export interface AudioFile {
  id: string;
  projectId: string;
  filename: string;
  originalName: string;
  storagePath: string;
  url: string;
  metadata: AudioMetadata;
  status: TaskStatus;
  processingProgress: number; // 0 to 100
  processingStep?: string;
  errorMessage?: string;
  segments: WordSegment[];
  speakers: string[];
  languageDetected?: LanguageCode;
  isSynthetic?: boolean;
  isDistorted?: boolean;
  hasPii?: boolean;
  qualityScore?: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetLanguage: LanguageCode;
  guidelinesProfile: 'hindi_hi_IN' | 'general';
  audioFilesCount: number;
  totalDurationSeconds: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface QualityChecklistReport {
  timestamp: string;
  fileId: string;
  totalSegments: number;
  passedChecksCount: number;
  warningCount: number;
  errorCount: number;
  checklistItems: {
    id: string;
    label: string;
    passed: boolean;
    description: string;
    details?: string;
  }[];
  isReadyForExport: boolean;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt' | 'srt' | 'vtt';
  includeMetadata: boolean;
  includeConfidence: boolean;
  includeSpeakerHeader: boolean;
  filterStatus?: SegmentReviewStatus[];
}
