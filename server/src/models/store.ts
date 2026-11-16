import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { config } from '../config';

const DATA_FILE = path.join(config.uploadDir, 'voxalign-data.json');

export interface MemoryStoreData {
  users: any[];
  projects: any[];
  audioFiles: any[];
  auditLogs: any[];
}

let store: MemoryStoreData = {
  users: [],
  projects: [],
  audioFiles: [],
  auditLogs: []
};

// Load existing data from file if present
export function initStore() {
  try {
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      store = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[DataStore] Error reading store, initializing fresh memory store:', err);
  }

  // Ensure default demo accounts and projects are always present
  ensureDefaultAccounts();
  persistStore();
}

function ensureDefaultAccounts() {
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('Admin@123456', salt);
  const annotatorPassword = bcrypt.hashSync('Annotator@123456', salt);

  const adminId = 'usr_admin_001';
  const annotatorId = 'usr_annotator_001';

  if (!store.users) store.users = [];
  if (!store.projects) store.projects = [];
  if (!store.audioFiles) store.audioFiles = [];
  if (!store.auditLogs) store.auditLogs = [];

  if (!store.users.some(u => u.email === 'admin@voxalign.ai')) {
    store.users.unshift({
      id: adminId,
      email: 'admin@voxalign.ai',
      password: adminPassword,
      name: 'Dr. Alistair Vance (Lead Architect)',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      organization: 'VoxAlign AI Labs',
      quotaMinutes: 1000,
      usedMinutes: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  if (!store.users.some(u => u.email === 'annotator@voxalign.ai')) {
    store.users.push({
      id: annotatorId,
      email: 'annotator@voxalign.ai',
      password: annotatorPassword,
      name: 'Priya Sharma (Senior Speech Annotator)',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      organization: 'Indic Speech Corpora',
      quotaMinutes: 300,
      usedMinutes: 28,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  const projectId = 'proj_hindi_corpus_01';
  if (!store.projects.some(p => p.id === projectId)) {
    store.projects.push({
      id: projectId,
      userId: annotatorId,
      name: 'Hindi Conversational Corpus — Delhi NCR',
      description: 'Audio collection of spontaneous bilingual Hindi-English conversations for speech synthesis and forced alignment.',
      targetLanguage: 'hi-en',
      guidelinesProfile: 'hindi_hi_IN',
      audioFilesCount: 1,
      totalDurationSeconds: 18.45,
      status: 'active',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  const sampleAudio1Id = 'aud_hindi_sample_01';
  if (!store.audioFiles.some(a => a.id === sampleAudio1Id)) {
    store.audioFiles.push({
      id: sampleAudio1Id,
      projectId: projectId,
      userId: annotatorId,
      filename: 'delhi_dialogue_sample.wav',
      originalName: 'delhi_dialogue_sample.wav',
      storagePath: path.join(config.uploadDir, 'delhi_dialogue_sample.wav'),
      url: `/api/audio/${sampleAudio1Id}/stream`,
      metadata: {
        duration: 18.45,
        sampleRate: 16000,
        channels: 1,
        format: 'wav',
        fileSize: 590400
      },
      status: 'completed',
      processingProgress: 100,
      processingStep: 'Alignment Complete',
      speakers: ['Speaker 1', 'Speaker 2'],
      languageDetected: 'hi-en',
      isSynthetic: false,
      isDistorted: false,
      hasPii: false,
      qualityScore: 98,
      segments: [
        {
          id: 'seg_001',
          text: 'नमस्ते',
          start: 0.12,
          end: 0.65,
          speaker: 'Speaker 1',
          confidence: 0.99,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_002',
          text: 'मेरा',
          start: 0.72,
          end: 0.98,
          speaker: 'Speaker 1',
          confidence: 0.98,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_003',
          text: 'नाम',
          start: 1.02,
          end: 1.34,
          speaker: 'Speaker 1',
          confidence: 0.99,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_004',
          text: 'राहुल',
          start: 1.40,
          end: 1.82,
          speaker: 'Speaker 1',
          confidence: 0.97,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_005',
          text: 'है',
          start: 1.88,
          end: 2.10,
          speaker: 'Speaker 1',
          confidence: 0.99,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_006',
          text: 'अं',
          start: 2.45,
          end: 2.78,
          speaker: 'Speaker 1',
          confidence: 0.94,
          language: 'hi',
          isHesitation: true,
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_007',
          text: 'आज',
          start: 2.92,
          end: 3.25,
          speaker: 'Speaker 1',
          confidence: 0.98,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_008',
          text: 'मौसम',
          start: 3.30,
          end: 3.75,
          speaker: 'Speaker 1',
          confidence: 0.98,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_009',
          text: 'बहुत',
          start: 3.82,
          end: 4.15,
          speaker: 'Speaker 1',
          confidence: 0.99,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_010',
          text: 'cold',
          start: 4.22,
          end: 4.68,
          speaker: 'Speaker 1',
          confidence: 0.96,
          language: 'en',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_011',
          text: 'है',
          start: 4.74,
          end: 4.95,
          speaker: 'Speaker 1',
          confidence: 0.99,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_012',
          text: 'हाँ',
          start: 5.30,
          end: 5.62,
          speaker: 'Speaker 2',
          confidence: 0.99,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_013',
          text: 'जी',
          start: 5.68,
          end: 5.95,
          speaker: 'Speaker 2',
          confidence: 0.98,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_014',
          text: 'हम्म',
          start: 6.20,
          end: 6.75,
          speaker: 'Speaker 2',
          confidence: 0.95,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_015',
          text: 'कल',
          start: 7.10,
          end: 7.42,
          speaker: 'Speaker 2',
          confidence: 0.97,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_016',
          text: 'भी',
          start: 7.48,
          end: 7.70,
          speaker: 'Speaker 2',
          confidence: 0.98,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_017',
          text: 'पंद्रह',
          start: 7.78,
          end: 8.24,
          speaker: 'Speaker 2',
          confidence: 0.96,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_018',
          text: 'डिग्री',
          start: 8.30,
          end: 8.78,
          speaker: 'Speaker 2',
          confidence: 0.97,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_019',
          text: 'तापमान',
          start: 8.84,
          end: 9.38,
          speaker: 'Speaker 2',
          confidence: 0.98,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        },
        {
          id: 'seg_020',
          text: 'था',
          start: 9.42,
          end: 9.70,
          speaker: 'Speaker 2',
          confidence: 0.99,
          language: 'hi',
          reviewStatus: 'verified',
          validationIssues: []
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  if (!store.auditLogs || store.auditLogs.length === 0) {
    store.auditLogs = [
      {
        id: uuidv4(),
        userId: annotatorId,
        userEmail: 'annotator@voxalign.ai',
        action: 'PROJECT_CREATED',
        entityType: 'project',
        entityId: projectId,
        details: { name: 'Hindi Conversational Corpus — Delhi NCR' },
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: uuidv4(),
        userId: annotatorId,
        userEmail: 'annotator@voxalign.ai',
        action: 'AUDIO_ALIGNED',
        entityType: 'audio',
        entityId: sampleAudio1Id,
        details: { segmentCount: 20, qualityScore: 98 },
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ];
  }
}

export function persistStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DataStore] Failed to persist data to disk:', err);
  }
}

// User CRUD
export const UserStore = {
  find: (query?: any) => {
    let result = [...store.users];
    if (query?.role) result = result.filter(u => u.role === query.role);
    return result;
  },
  findById: (id: string) => store.users.find(u => u.id === id),
  findByEmail: (email: string) => store.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  create: (userData: any) => {
    const user = {
      id: userData.id || `usr_${uuidv4().substring(0, 8)}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.users.push(user);
    persistStore();
    return user;
  },
  update: (id: string, updates: any) => {
    const idx = store.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    store.users[idx] = { ...store.users[idx], ...updates, updatedAt: new Date().toISOString() };
    persistStore();
    return store.users[idx];
  },
  delete: (id: string) => {
    const idx = store.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    store.users.splice(idx, 1);
    persistStore();
    return true;
  }
};

// Project CRUD
export const ProjectStore = {
  find: (query?: any) => {
    let result = [...store.projects];
    if (query?.userId) result = result.filter(p => p.userId === query.userId);
    if (query?.status) result = result.filter(p => p.status === query.status);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  findById: (id: string) => store.projects.find(p => p.id === id),
  create: (projectData: any) => {
    const proj = {
      id: projectData.id || `proj_${uuidv4().substring(0, 8)}`,
      audioFilesCount: 0,
      totalDurationSeconds: 0,
      status: 'active',
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.projects.push(proj);
    persistStore();
    return proj;
  },
  update: (id: string, updates: any) => {
    const idx = store.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    store.projects[idx] = { ...store.projects[idx], ...updates, updatedAt: new Date().toISOString() };
    persistStore();
    return store.projects[idx];
  },
  delete: (id: string) => {
    const idx = store.projects.findIndex(p => p.id === id);
    if (idx === -1) return false;
    store.projects.splice(idx, 1);
    // Cascade delete associated audio files
    store.audioFiles = store.audioFiles.filter(a => a.projectId !== id);
    persistStore();
    return true;
  }
};

// AudioFile CRUD
export const AudioFileStore = {
  find: (query?: any) => {
    let result = [...store.audioFiles];
    if (query?.projectId) result = result.filter(a => a.projectId === query.projectId);
    if (query?.userId) result = result.filter(a => a.userId === query.userId);
    if (query?.status) result = result.filter(a => a.status === query.status);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  findById: (id: string) => store.audioFiles.find(a => a.id === id),
  create: (audioData: any) => {
    const file = {
      id: audioData.id || `aud_${uuidv4().substring(0, 8)}`,
      segments: [],
      speakers: ['Speaker 1'],
      status: 'pending',
      processingProgress: 0,
      qualityScore: 100,
      ...audioData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.audioFiles.push(file);

    // Update project stats
    const project = ProjectStore.findById(file.projectId);
    if (project) {
      ProjectStore.update(project.id, {
        audioFilesCount: (project.audioFilesCount || 0) + 1,
        totalDurationSeconds: (project.totalDurationSeconds || 0) + (file.metadata?.duration || 0)
      });
    }

    persistStore();
    return file;
  },
  update: (id: string, updates: any) => {
    const idx = store.audioFiles.findIndex(a => a.id === id);
    if (idx === -1) return null;
    store.audioFiles[idx] = { ...store.audioFiles[idx], ...updates, updatedAt: new Date().toISOString() };
    persistStore();
    return store.audioFiles[idx];
  },
  delete: (id: string) => {
    const idx = store.audioFiles.findIndex(a => a.id === id);
    if (idx === -1) return false;
    const file = store.audioFiles[idx];
    store.audioFiles.splice(idx, 1);

    // Update project stats
    const project = ProjectStore.findById(file.projectId);
    if (project) {
      ProjectStore.update(project.id, {
        audioFilesCount: Math.max(0, (project.audioFilesCount || 1) - 1),
        totalDurationSeconds: Math.max(0, (project.totalDurationSeconds || 0) - (file.metadata?.duration || 0))
      });
    }

    persistStore();
    return true;
  }
};

// AuditLog CRUD
export const AuditLogStore = {
  find: (query?: any) => {
    let result = [...store.auditLogs];
    if (query?.userId) result = result.filter(l => l.userId === query.userId);
    if (query?.entityType) result = result.filter(l => l.entityType === query.entityType);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  create: (logData: any) => {
    const log = {
      id: uuidv4(),
      ...logData,
      createdAt: new Date().toISOString()
    };
    store.auditLogs.unshift(log);
    // Keep max 1000 logs
    if (store.auditLogs.length > 1000) store.auditLogs.pop();
    persistStore();
    return log;
  }
};
