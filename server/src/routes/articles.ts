import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { articles } from '../db/schema.js';
import { eq, like, desc, and, sql } from 'drizzle-orm';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// Escape LIKE wildcard characters to prevent unintended pattern matching
function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}

const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

const listArticlesSchema = z.object({
  query: z.object({
    sourceId: z.coerce.number().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
    search: z.string().max(200).optional(),
  }),
});

// GET /api/articles - List with filters
router.get('/', validate(listArticlesSchema), async (req, res) => {
  const { sourceId, limit, offset, search } = req.query as unknown as {
    sourceId?: number;
    limit: number;
    offset: number;
    search?: string;
  };

  const conditions = [];
  if (sourceId) conditions.push(eq(articles.sourceId, sourceId));
  if (search) conditions.push(like(articles.title, `%${escapeLikePattern(search)}%`));

  const result = await db.query.articles.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { source: true },
    orderBy: [desc(articles.archivedAt)],
    limit,
    offset,
  });

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const count = countResult?.count ?? 0;

  res.json({
    data: result,
    pagination: {
      total: count,
      limit,
      offset,
      hasMore: offset + limit < count,
    },
  });
});

// GET /api/articles/search - Full-text search (stub for FTS5)
router.get('/search', async (req, res) => {
  const { q } = req.query;

  // TODO: Implement FTS5 search
  res.json({
    message: 'Full-text search not yet implemented',
    query: q,
    results: [],
  });
});

// GET /api/articles/:id
router.get('/:id', validate(idParamSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const result = await db.query.articles.findFirst({
    where: eq(articles.id, id),
    with: { source: true, articleTags: { with: { tag: true } } },
  });
  if (!result) throw new AppError(404, 'Article not found');
  res.json({ data: result });
});

// DELETE /api/articles/:id
router.delete('/:id', validate(idParamSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const [result] = await db
    .delete(articles)
    .where(eq(articles.id, id))
    .returning();
  if (!result) throw new AppError(404, 'Article not found');

  // TODO: Delete associated files from storage
  res.status(204).send();
});

export default router;
