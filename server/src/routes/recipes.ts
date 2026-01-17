import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { recipes } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

const selectorsSchema = z.object({
  articleList: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  links: z.string().optional(),
});

const paginationSchema = z.object({
  type: z.enum(['click', 'url', 'infinite']).optional(),
  selector: z.string().optional(),
  urlPattern: z.string().optional(),
  maxPages: z.number().optional(),
});

const filtersSchema = z.object({
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
});

const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});

const createRecipeSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    selectors: selectorsSchema.optional(),
    pagination: paginationSchema.optional(),
    filters: filtersSchema.optional(),
  }),
});

const updateRecipeSchema = z.object({
  params: z.object({ id: z.coerce.number() }),
  body: z.object({
    name: z.string().min(1).optional(),
    selectors: selectorsSchema.optional(),
    pagination: paginationSchema.optional(),
    filters: filtersSchema.optional(),
  }),
});

// GET /api/recipes
router.get('/', async (_req, res) => {
  const result = await db.query.recipes.findMany({
    orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
  });
  res.json({ data: result });
});

// POST /api/recipes
router.post('/', validate(createRecipeSchema), async (req, res) => {
  const [result] = await db.insert(recipes).values(req.body).returning();
  res.status(201).json({ data: result });
});

// GET /api/recipes/:id
router.get('/:id', validate(idParamSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const result = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
  });
  if (!result) throw new AppError(404, 'Recipe not found');
  res.json({ data: result });
});

// PUT /api/recipes/:id
router.put('/:id', validate(updateRecipeSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const [result] = await db
    .update(recipes)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(recipes.id, id))
    .returning();
  if (!result) throw new AppError(404, 'Recipe not found');
  res.json({ data: result });
});

// DELETE /api/recipes/:id
router.delete('/:id', validate(idParamSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const [result] = await db
    .delete(recipes)
    .where(eq(recipes.id, id))
    .returning();
  if (!result) throw new AppError(404, 'Recipe not found');
  res.status(204).send();
});

// POST /api/recipes/:id/test - Test selectors against a URL
const testRecipeSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    url: z.string().url(),
  }),
});

router.post('/:id/test', validate(testRecipeSchema), async (req, res) => {
  const { id } = req.params as unknown as { id: number };
  const { url } = req.body as { url: string };

  const recipe = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
  });
  if (!recipe) throw new AppError(404, 'Recipe not found');

  // TODO: Implement selector testing with Playwright
  res.json({
    message: 'Selector test not yet implemented',
    recipeId: id,
    url,
    matches: [],
  });
});

export default router;
