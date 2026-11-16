import axios from 'axios';
import { Project, AudioFile, QualityChecklistReport, ExportOptions, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data?.error || error.message || 'Network error');
  }
);

export const authApi = {
  login: (data: any) => api.post<{ message: string; user: User; token: string }>('/auth/login', data),
  register: (data: any) => api.post<{ message: string; user: User; token: string }>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get<{ user: User }>('/auth/me'),
  updateProfile: (data: any) => api.put<{ user: User; message: string }>('/auth/profile', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

export const projectApi = {
  list: () => api.get<{ projects: Project[] }>('/projects'),
  create: (data: { name: string; description?: string; targetLanguage?: string; guidelinesProfile?: string }) => 
    api.post<{ project: Project; message: string }>('/projects', data),
  get: (id: string) => api.get<{ project: Project; audioFiles: AudioFile[] }>(`/projects/${id}`),
  update: (id: string, data: Partial<Project>) => api.put<{ project: Project; message: string }>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  getStats: (id: string) => api.get<any>(`/projects/${id}/stats`),
};

export const audioApi = {
  upload: (projectId: string, files: File[]) => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    files.forEach(f => formData.append('audio_files', f));
    return api.post<{ message: string; files: AudioFile[] }>('/audio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  get: (id: string) => api.get<{ file: AudioFile }>(`/audio/${id}`),
  process: (id: string) => api.post(`/audio/${id}/process`),
  updateSegments: (id: string, segments: any[], speakers?: string[]) => 
    api.put<{ message: string; file: AudioFile; qcReport: QualityChecklistReport }>(`/audio/${id}/segments`, { segments, speakers }),
  getQc: (id: string) => api.get<{ qcReport: QualityChecklistReport }>(`/audio/${id}/qc`),
  export: (id: string, options: ExportOptions) => 
    api.post(`/audio/${id}/export`, options, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/audio/${id}`),
};

export const adminApi = {
  getStats: () => api.get<any>('/admin/stats'),
  getUsers: () => api.get<{ users: User[] }>('/admin/users'),
  updateUser: (id: string, data: any) => api.put<{ user: User; message: string }>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getAuditLogs: (params?: any) => api.get<{ logs: any[] }>('/admin/audit-logs', { params }),
  getHealth: () => api.get<any>('/admin/system-health'),
};

export default api;
