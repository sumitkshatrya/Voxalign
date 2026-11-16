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

export type LanguageCode = 'hi' | 'en' | 'hi-en';

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

export interface WordSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  speaker: string;
  confidence?: number;
  language?: LanguageCode;
  reviewStatus: SegmentReviewStatus;
  isHesitation?: boolean;
  isUnintelligible?: boolean;
  isCutOff?: boolean;
  isPlausibleGuess?: boolean;
  validationIssues?: ValidationIssue[];
}

export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
  fileSize: number;
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
  processingProgress: number;
  processingStep?: string;
  errorMessage?: string;
  segments: WordSegment[];
  speakers: string[];
  languageDetected?: LanguageCode;
  isSynthetic?: boolean;
  isDistorted?: boolean;
  hasPii?: boolean;
  qualityScore?: number;
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
