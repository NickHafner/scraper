import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { jobs } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

const listJobsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(100).default(50),
  }),
});

// GET /api/jobs - List recent jobs
router.get('/', validate(listJobsSchema), async (req, res) => {
  const { limit } = req.query as unknown as { limit: number };

  const result = await db.query.jobs.findMany({
    with: { source: true },
    orderBy: [desc(jobs.createdAt)],
    limit,
  });
  res.json({ data: result });
});

// GET /api/jobs/:id
router.get('/:id', validate(idParamSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const result = await db.query.jobs.findFirst({
    where: eq(jobs.id, id),
    with: { source: true },
  });
  if (!result) throw new AppError(404, 'Job not found');
  res.json({ data: result });
});

// DELETE /api/jobs/:id - Cancel job
router.delete('/:id', validate(idParamSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
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
