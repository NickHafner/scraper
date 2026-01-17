import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { sources } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// Validation schemas
const createSourceSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    recipeId: z.number().optional(),
    schedule: z.string().optional(),
  }),
});

const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

const updateSourceSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    name: z.string().min(1).optional(),
    url: z.string().url().optional(),
    recipeId: z.number().nullable().optional(),
    schedule: z.string().nullable().optional(),
    status: z.enum(['active', 'paused', 'error']).optional(),
  }),
});

// GET /api/sources - List all sources
router.get('/', async (_req, res) => {
  const result = await db.query.sources.findMany({
    with: { recipe: true },
    orderBy: (sources, { desc }) => [desc(sources.createdAt)],
  });
  res.json({ data: result });
});

// POST /api/sources - Create source
router.post('/', validate(createSourceSchema), async (req, res) => {
  const [result] = await db.insert(sources).values(req.body).returning();
  res.status(201).json({ data: result });
});

// GET /api/sources/:id - Get single source
router.get('/:id', validate(idParamSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const result = await db.query.sources.findFirst({
    where: eq(sources.id, id),
    with: { recipe: true, jobs: { limit: 10 } },
  });
  if (!result) throw new AppError(404, 'Source not found');
  res.json({ data: result });
});

// PUT /api/sources/:id - Update source
router.put('/:id', validate(updateSourceSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const [result] = await db
    .update(sources)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(sources.id, id))
    .returning();
  if (!result) throw new AppError(404, 'Source not found');
  res.json({ data: result });
});

// DELETE /api/sources/:id - Delete source
router.delete('/:id', validate(idParamSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const [result] = await db
    .delete(sources)
    .where(eq(sources.id, id))
    .returning();
  if (!result) throw new AppError(404, 'Source not found');
  res.status(204).send();
});

// POST /api/sources/:id/run - Trigger scrape job
router.post('/:id/run', validate(idParamSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const source = await db.query.sources.findFirst({
    where: eq(sources.id, id),
  });
  if (!source) throw new AppError(404, 'Source not found');

  // TODO: Queue scrape job with BullMQ
  res.json({
    message: 'Scrape job queued',
    sourceId: id,
    jobId: null,
  });
});

export default router;
