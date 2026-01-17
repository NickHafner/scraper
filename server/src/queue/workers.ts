import { Worker, Job } from 'bullmq';
import { redisConnection } from './connection.js';
import type { ScrapeJobData, ArticleJobData } from './queues.js';
import { db } from '../db/index.js';
import { jobs } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Scrape Worker - processes source scraping jobs
export const scrapeWorker = new Worker<ScrapeJobData>(
  'scrape',
  async (job: Job<ScrapeJobData>) => {
    const { sourceId } = job.data;

    console.log(`Processing scrape job for source ${sourceId}`);

    // Update job status in database
    if (job.id) {
      await db
        .update(jobs)
        .set({ status: 'running', startedAt: new Date() })
        .where(eq(jobs.bullmqId, job.id));
    }

    try {
      // TODO: Implement actual scraping with Crawlee
      // 1. Load source URL
      // 2. Apply recipe selectors
      // 3. Extract article URLs
      // 4. Queue ArticleWorker jobs for each

      await job.updateProgress(100);

      // Update job as completed
      if (job.id) {
        await db
          .update(jobs)
          .set({
            status: 'completed',
            completedAt: new Date(),
            articlesFound: 0,
            articlesNew: 0,
          })
          .where(eq(jobs.bullmqId, job.id));
      }

      return { articlesFound: 0, articlesNew: 0 };
    } catch (error) {
      // Update job as failed
      if (job.id) {
        await db
          .update(jobs)
          .set({
            status: 'failed',
            completedAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          .where(eq(jobs.bullmqId, job.id));
      }

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

// Article Worker - processes individual articles
export const articleWorker = new Worker<ArticleJobData>(
  'article',
  async (job: Job<ArticleJobData>) => {
    const { url } = job.data;

    console.log(`Processing article: ${url}`);

    // TODO: Implement article processing
    // 1. Download page content
    // 2. Extract text using recipe selectors
    // 3. Generate content hash
    // 4. Check for duplicates
    // 5. Save to database and storage

    return { url, processed: true };
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

// Worker event handlers
scrapeWorker.on('completed', (job) => {
  console.log(`Scrape job ${job.id} completed`);
});

scrapeWorker.on('failed', (job, err) => {
  console.error(`Scrape job ${job?.id} failed:`, err);
});

articleWorker.on('completed', (job) => {
  console.log(`Article job ${job.id} completed`);
});

articleWorker.on('failed', (job, err) => {
  console.error(`Article job ${job?.id} failed:`, err);
});
