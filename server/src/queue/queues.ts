import { Queue } from 'bullmq';
import { redisConnection } from './connection.js';

// Queue for source scraping jobs
export const scrapeQueue = new Queue('scrape', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

// Queue for individual article processing
export const articleQueue = new Queue('article', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});

// Queue for scheduled jobs
export const schedulerQueue = new Queue('scheduler', {
  connection: redisConnection,
});

// Export types for job data
export interface ScrapeJobData {
  sourceId: number;
  recipeId: number;
  maxPages?: number;
}

export interface ArticleJobData {
  url: string;
  sourceId: number;
  recipeId: number;
}
