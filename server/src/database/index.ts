import mongoose from 'mongoose';
import { config } from '../config';

let isConnected = false;
let isInMemoryFallback = false;

export async function connectDB(): Promise<boolean> {
  try {
    // Attempt Mongoose connection with short timeout so it doesn't hang if Mongo isn't up
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    isInMemoryFallback = false;
    console.log(`[Database] MongoDB connected successfully to ${config.mongoUri}`);
    return true;
  } catch (err: any) {
    console.warn(`[Database] MongoDB connection failed (${err.message}). Activating resilient local storage mode.`);
    isConnected = true;
    isInMemoryFallback = true;
    return false;
  }
}

export function getDatabaseStatus() {
  return {
    connected: isConnected,
    mode: isInMemoryFallback ? 'resilient_local_storage' : 'mongodb',
    uri: config.mongoUri
  };
}
