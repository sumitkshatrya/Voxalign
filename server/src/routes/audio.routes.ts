import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as mm from 'music-metadata';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadAudio } from '../middleware/upload';
import { AudioFileStore, ProjectStore, AuditLogStore } from '../models/store';
import { enqueueAudioProcessing } from '../services/queue.service';
import { validateSegment, validateTranscript } from '../shared/guidelines/hindi-rules';
import { emitSegmentUpdated } from '../socket';
import { WordSegment, ExportOptions } from '../shared/types';

const router = Router();

// Stream audio endpoint does NOT require auth header so <audio> and WaveSurfer can fetch ranges without token headers
router.get('/:id/stream', (req: Request, res: Response): void => {
  const id = String(req.params.id);
  const file = AudioFileStore.findById(id);

  if (!file || !fs.existsSync(file.storagePath)) {
    res.status(404).json({ error: 'Audio file not found on disk.' });
    return;
  }

  const stat = fs.statSync(file.storagePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Determine content type
  const ext = path.extname(file.storagePath).toLowerCase();
  let contentType = 'audio/mpeg';
  if (ext === '.wav') contentType = 'audio/wav';
  else if (ext === '.m4a') contentType = 'audio/mp4';
  else if (ext === '.flac') contentType = 'audio/flac';
  else if (ext === '.ogg') contentType = 'audio/ogg';

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const stream = fs.createReadStream(file.storagePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    stream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(file.storagePath).pipe(res);
  }
});

// Protect remaining endpoints with authentication
router.use(authenticate);

// POST /api/audio/upload - Upload one or more audio files
router.post('/upload', uploadAudio.array('audio_files', 10), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { projectId } = req.body;

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No audio files provided.' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ error: 'projectId is required.' });
      return;
    }

    const project = ProjectStore.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const createdFiles: any[] = [];

    for (const file of files) {
      // Extract actual audio metadata using music-metadata
      let duration = 0;
      let sampleRate = 16000;
      let channels = 1;
      let bitrate = 128000;
      const ext = path.extname(file.originalname).replace('.', '').toLowerCase();

      try {
        const metadata = await mm.parseFile(file.path);
        duration = metadata.format.duration || 15.0;
        sampleRate = metadata.format.sampleRate || 16000;
        channels = metadata.format.numberOfChannels || 1;
        bitrate = metadata.format.bitrate || 128000;
      } catch (metaErr) {
        // Fallback default duration estimated from file size
        duration = Math.max(5, Math.round(file.size / 32000));
      }

      const audioRecord = AudioFileStore.create({
        projectId,
        userId: req.user!.id,
        filename: file.filename,
        originalName: file.originalname,
        storagePath: file.path,
        url: `/api/audio/${file.filename}/stream`,
        metadata: {
          duration: parseFloat(duration.toFixed(2)),
          sampleRate,
          channels,
          format: ext,
          fileSize: file.size,
          bitrate
        },
        status: 'queued',
        processingProgress: 5,
        processingStep: 'Queued for AI processing'
      });

      // Update url to use the real ID
      AudioFileStore.update(audioRecord.id, {
        url: `/api/audio/${audioRecord.id}/stream`
      });

      createdFiles.push(audioRecord);

      // Enqueue background processing
      await enqueueAudioProcessing(audioRecord.id, projectId, req.user!.id);
    }

    AuditLogStore.create({
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'AUDIO_UPLOADED',
      entityType: 'audio',
      entityId: createdFiles[0]?.id,
      details: { count: createdFiles.length, projectId }
    });

    res.status(201).json({
      message: `Successfully uploaded ${createdFiles.length} file(s).`,
      files: createdFiles
    });
  } catch (err: any) {
    console.error('[Upload] Error during audio upload:', err);
    res.status(500).json({ error: err.message || 'Audio upload failed.' });
  }
});

// GET /api/audio/:id - Audio file details & segments
router.get('/:id', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  const file = AudioFileStore.findById(id);

  if (!file) {
    res.status(404).json({ error: 'Audio file not found.' });
    return;
  }

  // Run validation on all segments to ensure fresh guideline compliance
  if (file.segments && file.segments.length > 0) {
    for (const seg of file.segments) {
      seg.validationIssues = validateSegment(seg, file.segments);
    }
  }

  res.json({ file });
});

// POST /api/audio/:id/process - Retry or trigger alignment
router.post('/:id/process', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const file = AudioFileStore.findById(id);

  if (!file) {
    res.status(404).json({ error: 'Audio file not found.' });
    return;
  }

  AudioFileStore.update(id, {
    status: 'queued',
    processingProgress: 5,
    processingStep: 'Re-queued for processing',
    errorMessage: undefined
  });

  await enqueueAudioProcessing(id, file.projectId, req.user!.id);

  res.json({ message: 'Processing started in background queue.' });
});

// PUT /api/audio/:id/segments - Save edited segments with Hindi guidelines validation
router.put('/:id/segments', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  const { segments, speakers } = req.body;

  const file = AudioFileStore.findById(id);
  if (!file) {
    res.status(404).json({ error: 'Audio file not found.' });
    return;
  }

  if (!Array.isArray(segments)) {
    res.status(400).json({ error: 'segments must be an array.' });
    return;
  }

  // Validate each segment against Hindi Guidelines
  const validatedSegments: WordSegment[] = segments.map((s: WordSegment) => {
    const issues = validateSegment(s, segments);
    return {
      ...s,
      validationIssues: issues
    };
  });

  // Calculate quality score
  const qcReport = validateTranscript(validatedSegments, id);
  const qualityScore = Math.max(50, Math.min(100, Math.round(100 - (qcReport.errorCount * 6) - (qcReport.warningCount * 2))));

  // Update speakers list if provided
  const updatedSpeakers = speakers || Array.from(new Set(validatedSegments.map(s => s.speaker)));

  const updated = AudioFileStore.update(id, {
    segments: validatedSegments,
    speakers: updatedSpeakers,
    qualityScore,
    reviewStatus: validatedSegments.every(s => s.reviewStatus === 'verified') ? 'verified' : 'in_review'
  });

  emitSegmentUpdated(id, validatedSegments);

  AuditLogStore.create({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'SEGMENTS_UPDATED',
    entityType: 'audio',
    entityId: id,
    details: { segmentCount: validatedSegments.length, qualityScore }
  });

  res.json({
    message: 'Segments saved and validated successfully.',
    file: updated,
    qcReport
  });
});

// GET /api/audio/:id/qc - Run Page 17 Quality Checklist
router.get('/:id/qc', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  const file = AudioFileStore.findById(id);

  if (!file) {
    res.status(404).json({ error: 'Audio file not found.' });
    return;
  }

  const qcReport = validateTranscript(file.segments || [], id);
  res.json({ qcReport });
});

// POST /api/audio/:id/export - Export annotations to JSON, CSV, TXT, SRT, VTT
router.post('/:id/export', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  const { format = 'json', includeMetadata = true, includeConfidence = true }: ExportOptions = req.body;
  const file = AudioFileStore.findById(id);

  if (!file) {
    res.status(404).json({ error: 'Audio file not found.' });
    return;
  }

  const project = ProjectStore.findById(file.projectId);
  const segments: WordSegment[] = file.segments || [];

  // Page 17 Validation Check before export
  const qc = validateTranscript(segments, id);

  AuditLogStore.create({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'ANNOTATIONS_EXPORTED',
    entityType: 'export',
    entityId: id,
    details: { format, segmentCount: segments.length }
  });

  if (format === 'json') {
    const exportData = {
      platform: 'VoxAlign',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      metadata: includeMetadata ? {
        fileId: file.id,
        filename: file.originalName,
        projectName: project?.name,
        targetLanguage: project?.targetLanguage,
        guidelinesProfile: project?.guidelinesProfile,
        durationSeconds: file.metadata?.duration,
        qualityScore: file.qualityScore,
        qcPassed: qc.isReadyForExport
      } : undefined,
      segments: segments.map(s => ({
        id: s.id,
        word: s.text,
        start: s.start,
        end: s.end,
        duration: parseFloat((s.end - s.start).toFixed(3)),
        speaker: s.speaker,
        language: s.language,
        reviewStatus: s.reviewStatus,
        ...(includeConfidence && { confidence: s.confidence })
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${path.parse(file.originalName).name}_aligned.json"`);
    res.send(JSON.stringify(exportData, null, 2));
    return;
  }

  if (format === 'csv') {
    let csv = 'segment_id,word,start_time,end_time,duration,speaker,language,review_status';
    if (includeConfidence) csv += ',confidence';
    csv += '\n';

    for (const s of segments) {
      const dur = (s.end - s.start).toFixed(3);
      const safeText = `"${s.text.replace(/"/g, '""')}"`;
      let line = `${s.id},${safeText},${s.start.toFixed(3)},${s.end.toFixed(3)},${dur},"${s.speaker}",${s.language || 'hi'},${s.reviewStatus}`;
      if (includeConfidence) line += `,${s.confidence || 1.0}`;
      csv += line + '\n';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${path.parse(file.originalName).name}_aligned.csv"`);
    res.send(csv);
    return;
  }

  if (format === 'txt') {
    let txt = '';
    if (includeMetadata) {
      txt += `VoxAlign Speech Annotation Export\n`;
      txt += `Audio File: ${file.originalName}\n`;
      txt += `Project: ${project?.name}\n`;
      txt += `Duration: ${file.metadata?.duration}s\n`;
      txt += `--------------------------------------------------\n\n`;
    }

    // Group segments by speaker turns
    let currentSpeaker = '';
    let currentLine = '';

    for (const s of segments) {
      if (s.speaker !== currentSpeaker) {
        if (currentLine) txt += `${currentSpeaker}: ${currentLine}\n\n`;
        currentSpeaker = s.speaker;
        currentLine = s.text;
      } else {
        currentLine += ' ' + s.text;
      }
    }
    if (currentLine) txt += `${currentSpeaker}: ${currentLine}\n`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${path.parse(file.originalName).name}_aligned.txt"`);
    res.send(txt);
    return;
  }

  if (format === 'srt' || format === 'vtt') {
    let sub = format === 'vtt' ? 'WEBVTT\n\n' : '';
    // Chunk words into subtitle groups (3-5 words each)
    const chunkSize = 4;
    let subIndex = 1;

    for (let i = 0; i < segments.length; i += chunkSize) {
      const chunk = segments.slice(i, i + chunkSize);
      const startTime = chunk[0].start;
      const endTime = chunk[chunk.length - 1].end;
      const chunkText = chunk.map(c => c.text).join(' ');

      if (format === 'srt') {
        sub += `${subIndex}\n`;
        sub += `${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n`;
        sub += `[${chunk[0].speaker}] ${chunkText}\n\n`;
      } else {
        sub += `${formatVttTime(startTime)} --> ${formatVttTime(endTime)}\n`;
        sub += `<v ${chunk[0].speaker}>${chunkText}\n\n`;
      }
      subIndex++;
    }

    res.setHeader('Content-Type', format === 'srt' ? 'text/plain; charset=utf-8' : 'text/vtt; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${path.parse(file.originalName).name}.${format}"`);
    res.send(sub);
    return;
  }

  res.status(400).json({ error: `Unsupported export format: ${format}` });
});

// DELETE /api/audio/:id - Delete audio file
router.delete('/:id', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  const file = AudioFileStore.findById(id);

  if (!file) {
    res.status(404).json({ error: 'Audio file not found.' });
    return;
  }

  // Remove file from disk
  try {
    if (fs.existsSync(file.storagePath)) {
      fs.unlinkSync(file.storagePath);
    }
  } catch (err) {
    console.warn(`[Audio] Failed to remove file from disk:`, err);
  }

  AudioFileStore.delete(id);

  AuditLogStore.create({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'AUDIO_DELETED',
    entityType: 'audio',
    entityId: id,
    details: { filename: file.originalName }
  });

  res.json({ message: 'Audio file deleted successfully.' });
});

function formatSrtTime(seconds: number): string {
  const date = new Date(0);
  date.setUTCMilliseconds(seconds * 1000);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const secs = String(date.getUTCSeconds()).padStart(2, '0');
  const millis = String(date.getUTCMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${secs},${millis}`;
}

function formatVttTime(seconds: number): string {
  const date = new Date(0);
  date.setUTCMilliseconds(seconds * 1000);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const secs = String(date.getUTCSeconds()).padStart(2, '0');
  const millis = String(date.getUTCMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${secs}.${millis}`;
}

export default router;
