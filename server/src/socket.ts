import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

let io: SocketIOServer | null = null;

export function initSocketIO(server: http.Server, corsOrigin: string): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('join:file', (fileId: string) => {
      socket.join(`file:${fileId}`);
    });

    socket.on('leave:file', (fileId: string) => {
      socket.leave(`file:${fileId}`);
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitFileProgress(fileId: string, projectId: string, step: string, progress: number) {
  if (!io) return;
  const payload = { fileId, projectId, step, progress, timestamp: new Date().toISOString() };
  io.to(`file:${fileId}`).emit('file:progress', payload);
  io.to(`project:${projectId}`).emit('file:progress', payload);
}

export function emitFileCompleted(fileId: string, projectId: string, result: any) {
  if (!io) return;
  const payload = { fileId, projectId, result, timestamp: new Date().toISOString() };
  io.to(`file:${fileId}`).emit('file:completed', payload);
  io.to(`project:${projectId}`).emit('file:completed', payload);
}

export function emitFileFailed(fileId: string, projectId: string, error: string) {
  if (!io) return;
  const payload = { fileId, projectId, error, timestamp: new Date().toISOString() };
  io.to(`file:${fileId}`).emit('file:failed', payload);
  io.to(`project:${projectId}`).emit('file:failed', payload);
}

export function emitSegmentUpdated(fileId: string, segments: any[]) {
  if (!io) return;
  io.to(`file:${fileId}`).emit('file:segments_updated', { fileId, segments });
}
