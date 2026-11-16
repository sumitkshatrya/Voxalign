import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${uuidv4().substring(0, 8)}${ext}`;
    cb(null, uniqueName);
  }
});

const allowedMimeTypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/flac',
  'audio/x-flac',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
  'video/mp4'
];

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.webm', '.mp4'];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported audio format (${ext}). Supported formats: MP3, WAV, M4A, FLAC, AAC, OGG.`));
  }
};

export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMB * 1024 * 1024 // 100MB default
  }
});
