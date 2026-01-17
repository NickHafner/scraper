import { Router } from 'express';

const router = Router();

// POST /api/proxy/navigate - Load page in headless browser
router.post('/navigate', async (_req, res) => {
  res.status(501).json({
    message: 'Browser proxy not yet implemented (Phase 3)',
  });
});

// POST /api/proxy/screenshot - Get current page state
router.post('/screenshot', async (_req, res) => {
  res.status(501).json({
    message: 'Browser proxy not yet implemented (Phase 3)',
  });
});

// POST /api/proxy/evaluate - Run selector, return matches
router.post('/evaluate', async (_req, res) => {
  res.status(501).json({
    message: 'Browser proxy not yet implemented (Phase 3)',
  });
});

export default router;
