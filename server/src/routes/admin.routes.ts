import { Router, Response } from 'express';
import os from 'os';
import axios from 'axios';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { UserStore, ProjectStore, AudioFileStore, AuditLogStore } from '../models/store';
import { getDatabaseStatus } from '../database';
import { getQueueStatus } from '../services/queue.service';
import { config } from '../config';

const router = Router();

// Only admin users can access admin routes
router.use(authenticate);
router.use(requireRole('admin'));

// GET /api/admin/stats - System-wide SaaS metrics
router.get('/stats', (_req: AuthRequest, res: Response): void => {
  const users = UserStore.find();
  const projects = ProjectStore.find();
  const files = AudioFileStore.find();

  let totalDuration = 0;
  let completedCount = 0;
  let processingCount = 0;
  let failedCount = 0;
  let totalSegments = 0;

  for (const f of files) {
    totalDuration += f.metadata?.duration || 0;
    if (f.status === 'completed') completedCount++;
    else if (f.status === 'failed') failedCount++;
    else processingCount++;

    totalSegments += (f.segments || []).length;
  }

  res.json({
    totalUsers: users.length,
    totalProjects: projects.length,
    totalAudioFiles: files.length,
    completedAnnotations: completedCount,
    pendingAnnotations: processingCount,
    failedJobs: failedCount,
    totalAudioDurationHours: parseFloat((totalDuration / 3600).toFixed(2)),
    totalAudioDurationMinutes: parseFloat((totalDuration / 60).toFixed(1)),
    totalSegmentsAligned: totalSegments,
    systemUptime: Math.round(process.uptime()),
    queueStatus: getQueueStatus()
  });
});

// GET /api/admin/users - User management
router.get('/users', (_req: AuthRequest, res: Response): void => {
  const users = UserStore.find().map((u: any) => {
    const { password: _, ...safe } = u;
    return safe;
  });
  res.json({ users });
});

// PUT /api/admin/users/:id - Update user role or quota
router.put('/users/:id', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  const { role, quotaMinutes, organization } = req.body;

  const user = UserStore.findById(id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const updated = UserStore.update(id, {
    ...(role && { role }),
    ...(quotaMinutes !== undefined && { quotaMinutes: Number(quotaMinutes) }),
    ...(organization && { organization })
  });

  AuditLogStore.create({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'ADMIN_USER_UPDATED',
    entityType: 'user',
    entityId: id,
    details: { role, quotaMinutes, organization }
  });

  const { password: _, ...safe } = updated;
  res.json({ user: safe, message: 'User updated successfully' });
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', (req: AuthRequest, res: Response): void => {
  const id = String(req.params.id);
  if (id === req.user!.id) {
    res.status(400).json({ error: 'Cannot delete your own admin account.' });
    return;
  }

  UserStore.delete(id);

  AuditLogStore.create({
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'ADMIN_USER_DELETED',
    entityType: 'user',
    entityId: id
  });

  res.json({ message: 'User deleted successfully' });
});

// GET /api/admin/audit-logs - Audit trail
router.get('/audit-logs', (req: AuthRequest, res: Response): void => {
  const { limit = '100', entityType } = req.query;
  let logs = AuditLogStore.find({
    ...(entityType && { entityType: String(entityType) })
  });

  if (limit) {
    logs = logs.slice(0, parseInt(String(limit), 10));
  }

  res.json({ logs });
});

// GET /api/admin/system-health - Diagnostics & server metrics
router.get('/system-health', async (_req: AuthRequest, res: Response): Promise<void> => {
  let aiServiceAlive = false;
  let aiServiceLatencyMs = 0;

  try {
    const start = Date.now();
    const resp = await axios.get(`${config.aiServiceUrl}/health`, { timeout: 1500 });
    aiServiceAlive = resp.status === 200;
    aiServiceLatencyMs = Date.now() - start;
  } catch (e) {
    aiServiceAlive = false;
  }

  const memoryUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    database: getDatabaseStatus(),
    queue: getQueueStatus(),
    aiService: {
      url: config.aiServiceUrl,
      reachable: aiServiceAlive,
      latencyMs: aiServiceLatencyMs
    },
    system: {
      platform: os.platform(),
      release: os.release(),
      cpuCount: os.cpus().length,
      memory: {
        processRssMB: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        totalSystemGB: parseFloat((totalMem / (1024 ** 3)).toFixed(1)),
        freeSystemGB: parseFloat((freeMem / (1024 ** 3)).toFixed(1))
      }
    }
  });
});

export default router;
