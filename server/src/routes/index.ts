import { Router } from 'express';
import sourcesRouter from './sources.js';
import recipesRouter from './recipes.js';
import articlesRouter from './articles.js';
import jobsRouter from './jobs.js';
import proxyRouter from './proxy.js';

const router = Router();

router.use('/sources', sourcesRouter);
router.use('/recipes', recipesRouter);
router.use('/articles', articlesRouter);
router.use('/jobs', jobsRouter);
router.use('/proxy', proxyRouter);

export default router;
