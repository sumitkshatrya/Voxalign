import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { connectDB } from './database';
import { initStore } from './models/store';
import { initQueue } from './services/queue.service';
import { initSocketIO } from './socket';

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import audioRoutes from './routes/audio.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server, config.corsOrigin);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Parsing
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
app.use('/uploads', express.static(config.uploadDir));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'VoxAlign Speech Intelligence API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ServerError]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
async function start() {
  initStore();
  await connectDB();
  await initQueue();

  server.listen(config.port, () => {
    console.log(`=================================================`);
    console.log(`  VOXALIGN API SERVER STARTED ON PORT ${config.port}`);
    console.log(`  Environment: ${config.env}`);
    console.log(`  Client Origin: ${config.corsOrigin}`);
    console.log(`  Upload Directory: ${config.uploadDir}`);
    console.log(`=================================================`);
  });
}

start().catch(err => {
  console.error('[Fatal] Server failed to start:', err);
  process.exit(1);
});

export { app, server };
