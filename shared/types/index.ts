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

// Multilingual Speech Codes (Indic + Global)
export type LanguageCode = 
  | 'hi'          // Hindi (हिन्दी)
  | 'en'          // English
  | 'hi-en'       // Hinglish (Hindi-English code-switched)
  | 'bn'          // Bengali (বাংলা)
  | 'ta'          // Tamil (தமிழ்)
  | 'te'          // Telugu (తెలుగు)
  | 'mr'          // Marathi (मराठी)
  | 'gu'          // Gujarati (ગુજરાતી)
  | 'kn'          // Kannada (ಕನ್ನಡ)
  | 'ml'          // Malayalam (മലയാളം)
  | 'pa'          // Punjabi (ਪੰਜਾਬੀ)
  | 'or'          // Odia (ଓଡ଼ିଆ)
  | 'ur'          // Urdu (اردو)
  | 'as'          // Assamese (অসমীয়া)
  | 'es'          // Spanish (Español)
  | 'fr'          // French (Français)
  | 'de'          // German (Deutsch)
  | 'ar'          // Arabic (العربية)
  | 'multilingual'; // Mixed Multilingual Speech

export interface LanguageDefinition {
  code: LanguageCode;
  name: string;
  nativeName: string;
  family: 'indic' | 'dravidian' | 'european' | 'semitic' | 'mixed';
  scriptName: string;
  hesitationToken: string;
  thinkingToken: string;
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', family: 'indic', scriptName: 'Devanagari', hesitationToken: 'अं', thinkingToken: 'हम्म' },
  { code: 'hi-en', name: 'Hinglish', nativeName: 'हिन्दी + English', family: 'mixed', scriptName: 'Devanagari / Latin', hesitationToken: 'अं', thinkingToken: 'हम्म' },
  { code: 'en', name: 'English', nativeName: 'English', family: 'european', scriptName: 'Latin', hesitationToken: 'um', thinkingToken: 'hmm' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', family: 'indic', scriptName: 'Bengali', hesitationToken: 'অ্যাঁ', thinkingToken: 'হুম' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', family: 'dravidian', scriptName: 'Tamil', hesitationToken: 'ம்', thinkingToken: 'ஆங்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', family: 'dravidian', scriptName: 'Telugu', hesitationToken: 'అం', thinkingToken: 'హ్మ్' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', family: 'indic', scriptName: 'Devanagari', hesitationToken: 'अं', thinkingToken: 'हम्म' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', family: 'indic', scriptName: 'Gujarati', hesitationToken: 'અં', thinkingToken: 'હમ્મ' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', family: 'dravidian', scriptName: 'Kannada', hesitationToken: 'ಅಂ', thinkingToken: 'ಹ್ಮ್' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', family: 'dravidian', scriptName: 'Malayalam', hesitationToken: 'മ്', thinkingToken: 'ഹ്മ്' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', family: 'indic', scriptName: 'Gurmukhi', hesitationToken: 'ਅੰ', thinkingToken: 'ਹੰਮ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', family: 'indic', scriptName: 'Odia', hesitationToken: 'ଉଁ', thinkingToken: 'ହୁଁ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', family: 'indic', scriptName: 'Perso-Arabic', hesitationToken: 'اں', thinkingToken: 'ہمم' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', family: 'indic', scriptName: 'Assamese', hesitationToken: 'অঁ', thinkingToken: 'হুম' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', family: 'european', scriptName: 'Latin', hesitationToken: 'eh', thinkingToken: 'mmm' },
  { code: 'fr', name: 'French', nativeName: 'Français', family: 'european', scriptName: 'Latin', hesitationToken: 'euh', thinkingToken: 'hum' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', family: 'european', scriptName: 'Latin', hesitationToken: 'äh', thinkingToken: 'mhm' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', family: 'semitic', scriptName: 'Arabic', hesitationToken: 'امم', thinkingToken: 'همم' },
  { code: 'multilingual', name: 'Multilingual / Code-Switched', nativeName: 'Multilingual', family: 'mixed', scriptName: 'Mixed Scripts', hesitationToken: 'अं', thinkingToken: 'हम्म' }
];

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

export type GuidelinesProfile = 
  | 'hindi_hi_IN'
  | 'indic_multilingual'
  | 'general';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetLanguage: LanguageCode;
  guidelinesProfile: GuidelinesProfile;
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
