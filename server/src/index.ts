import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import routes from './routes/index.js';
import { getViteAssets, isDev, getClientDistPath } from './lib/vite.js';

const app = express();

// View engine setup
app.set('view engine', 'pug');
app.set('views', join(import.meta.dirname, 'views'));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

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
app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  if (isDev()) {
    console.log('Development mode: Vite dev server expected at http://localhost:5173');
  }
});

export default app;
