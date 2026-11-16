import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { processAudioFile } from './ai.service';

interface AudioJobData {
  fileId: string;
  projectId: string;
  userId: string;
}

let audioQueue: Queue<AudioJobData> | null = null;
let isRedisAvailable = false;

// In-memory queue fallback for standalone local execution
const memoryQueue: AudioJobData[] = [];
let isProcessingMemoryQueue = false;

export async function initQueue() {
  try {
    const redisConnection = new IORedis(config.redisUrl, {
      maxRetriesPerRequest: null,
      connectTimeout: 1000,
      retryStrategy: () => null, // don't endlessly retry if not running
      lazyConnect: true
    });

    // Suppress unhandled error log if redis daemon is down
    redisConnection.on('error', (e) => {
      // handled silently
    });

    await redisConnection.connect();
    isRedisAvailable = true;
    console.log('[Queue] Redis connected successfully. BullMQ queue initialized.');

    audioQueue = new Queue('audio-alignment-queue', {
      connection: redisConnection
    });

    const worker = new Worker('audio-alignment-queue', async (job) => {
      console.log(`[Worker] Processing job ${job.id} for file ${job.data.fileId}`);
      await processAudioFile(job.data.fileId);
    }, {
      connection: redisConnection
    });

    worker.on('failed', (job, err) => {
      console.error(`[Worker] Job ${job?.id} failed with error:`, err);
    });

  } catch (err: any) {
    console.warn(`[Queue] Redis connection not active. Using asynchronous background queue fallback.`);
    isRedisAvailable = false;
  }
}

export async function enqueueAudioProcessing(fileId: string, projectId: string, userId: string) {
  if (isRedisAvailable && audioQueue) {
    await audioQueue.add(`audio-${fileId}`, { fileId, projectId, userId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });
  } else {
    // Memory queue fallback
    memoryQueue.push({ fileId, projectId, userId });
    triggerMemoryQueue();
  }
}

async function triggerMemoryQueue() {
  if (isProcessingMemoryQueue) return;
  isProcessingMemoryQueue = true;

  while (memoryQueue.length > 0) {
    const job = memoryQueue.shift();
    if (job) {
      try {
        console.log(`[MemoryQueue] Processing audio file ${job.fileId}`);
        await processAudioFile(job.fileId);
      } catch (err) {
        console.error(`[MemoryQueue] Error processing ${job.fileId}:`, err);
      }
    }
  }

  isProcessingMemoryQueue = false;
}

export function getQueueStatus() {
  return {
    mode: isRedisAvailable ? 'bullmq_redis' : 'async_memory_queue',
    pendingCount: memoryQueue.length,
    isProcessing: isProcessingMemoryQueue
  };
}
