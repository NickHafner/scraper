import { db } from '../db/index.js';
import { sources } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// TODO: Implement cron-based scheduling
// This will check sources with schedules and queue jobs accordingly

export async function checkScheduledSources(): Promise<void> {
  const activeSources = await db.query.sources.findMany({
    where: eq(sources.status, 'active'),
  });

  for (const source of activeSources) {
    if (!source.schedule) continue;

    // TODO: Parse cron expression and check if due
    // If due, queue a scrape job
    console.log(`Checking schedule for source ${source.id}: ${source.schedule}`);
  }
}

// Run scheduler check every minute
export function startScheduler(): void {
  console.log('Scheduler started');
  setInterval(() => {
    checkScheduledSources().catch(console.error);
  }, 60 * 1000);
}
