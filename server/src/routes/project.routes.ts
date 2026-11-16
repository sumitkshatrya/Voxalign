import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ProjectStore, AudioFileStore, AuditLogStore } from '../models/store';

const router = Router();

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  targetLanguage: z.enum(['hi', 'en', 'hi-en']).default('hi-en'),
  guidelinesProfile: z.enum(['hindi_hi_IN', 'general']).default('hindi_hi_IN')
});

// Apply auth to all project routes
router.use(authenticate);

// GET /api/projects - List user's projects
router.get('/', (req: AuthRequest, res: Response): void => {
  const userId = req.user!.id;
  const projects = ProjectStore.find({ userId });
  res.json({ projects });
});

// POST /api/projects - Create a new project
router.post('/', (req: AuthRequest, res: Response): void => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const userId = req.user!.id;
  const project = ProjectStore.create({
    userId,
    ...parsed.data
  });

  AuditLogStore.create({
    userId,
    userEmail: req.user!.email,
    action: 'PROJECT_CREATED',
    entityType: 'project',
    entityId: project.id,
    details: { name: project.name }
  });

  res.status(201).json({ project, message: 'Project created successfully' });
});

// GET /api/projects/:id - Project details with audio files
router.get('/:id', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  const project = ProjectStore.findById(id);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  // Check ownership unless admin
  if (project.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Access denied to this project.' });
    return;
  }

  const audioFiles = AudioFileStore.find({ projectId: id });
  res.json({ project, audioFiles });
});

// PUT /api/projects/:id - Update project
router.put('/:id', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  const project = ProjectStore.findById(id);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  if (project.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  const { name, description, targetLanguage, guidelinesProfile, status } = req.body;
  const updated = ProjectStore.update(id, {
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(targetLanguage && { targetLanguage }),
    ...(guidelinesProfile && { guidelinesProfile }),
    ...(status && { status })
  });

  AuditLogStore.create({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'PROJECT_UPDATED',
    entityType: 'project',
    entityId: id,
    details: req.body
  });

  res.json({ project: updated, message: 'Project updated successfully' });
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  const project = ProjectStore.findById(id);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  if (project.userId !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  ProjectStore.delete(id);

  AuditLogStore.create({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'PROJECT_DELETED',
    entityType: 'project',
    entityId: id,
    details: { name: project.name }
  });

  res.json({ message: 'Project deleted successfully' });
});

// GET /api/projects/:id/stats - Project overview statistics
router.get('/:id/stats', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  const files = AudioFileStore.find({ projectId: id });

  let totalSegments = 0;
  let verifiedSegments = 0;
  let flaggedSegments = 0;
  let unreviewedSegments = 0;
  let totalDuration = 0;

  for (const f of files) {
    totalDuration += f.metadata?.duration || 0;
    for (const seg of (f.segments || [])) {
      totalSegments++;
      if (seg.reviewStatus === 'verified') verifiedSegments++;
      else if (seg.reviewStatus === 'flagged') flaggedSegments++;
      else unreviewedSegments++;
    }
  }

  res.json({
    totalFiles: files.length,
    totalDuration,
    totalSegments,
    verifiedSegments,
    flaggedSegments,
    unreviewedSegments,
    completionPercentage: totalSegments > 0 ? Math.round((verifiedSegments / totalSegments) * 100) : 0
  });
});

export default router;
