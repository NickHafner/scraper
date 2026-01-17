import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import routes from './routes/index.js';
import { getViteAssets, isDev, getClientDistPath } from './lib/vite.js';
import { scrapeWorker, articleWorker } from './queue/workers.js';
import { redisConnection } from './queue/connection.js';

const app = express();

// View engine setup
app.set('view engine', 'pug');
app.set('views', join(import.meta.dirname, 'views'));

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: config.BODY_SIZE_LIMIT }));

// Serve static files from client/dist in production
if (!isDev()) {
  app.use(express.static(getClientDistPath()));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Catch-all route - serve the React app
// Express 5 uses {*path} syntax for wildcards
app.get('/{*path}', (req, res, next) => {
  // Skip API routes and static files
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }

  const { jsFile, cssFile } = getViteAssets();

  res.render('index', {
    isDev: isDev(),
    jsFile,
    cssFile,
    initialData: null, // Can pass SSR data here if needed
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  if (isDev()) {
    console.log('Development mode: Vite dev server expected at http://localhost:5173');
  }
  console.log('Workers started: scrape, article');
});

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down gracefully...`);

  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close workers
  await Promise.all([
    scrapeWorker.close(),
    articleWorker.close(),
  ]);
  console.log('Workers closed');

  // Close Redis connection
  await redisConnection.quit();
  console.log('Redis connection closed');

  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
