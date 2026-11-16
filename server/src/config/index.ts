import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/voxalign',
  jwtSecret: process.env.JWT_SECRET || 'voxalign_ultra_secure_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: 'voxalign_token',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
  uploadDir: path.resolve(__dirname, '../../uploads'),
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
