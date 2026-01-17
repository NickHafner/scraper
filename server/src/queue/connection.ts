import { Redis } from 'ioredis';
import { config } from '../config.js';

// Shared Redis connection for BullMQ
export const redisConnection = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null, // Required for BullMQ
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis');
});
