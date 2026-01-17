import { Router } from 'express';
import { db } from '../db/index.js';
import { jobs } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// GET /api/jobs - List recent jobs
router.get('/', async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? '50');

  const result = await db.query.jobs.findMany({
    with: { source: true },
    orderBy: [desc(jobs.createdAt)],
    limit,
  });
  res.json({ data: result });
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id ?? '');
  const result = await db.query.jobs.findFirst({
    where: eq(jobs.id, id),
    with: { source: true },
  });
  if (!result) throw new AppError(404, 'Job not found');
  res.json({ data: result });
});

// DELETE /api/jobs/:id - Cancel job
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id ?? '');
  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, id),
  });
  if (!job) throw new AppError(404, 'Job not found');

  // TODO: Cancel BullMQ job if still running
  const [result] = await db
    .update(jobs)
    .set({ status: 'cancelled', completedAt: new Date() })
    .where(eq(jobs.id, id))
    .returning();

  res.json({ data: result });
});

export default router;
