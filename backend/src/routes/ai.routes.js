import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/insight/:symbol/:changeEventId?', aiController.getWhyItMatters);
router.get('/watchlist-summary', authenticateToken, aiController.getWatchlistSummary);
router.post('/ask', authenticateToken, aiController.askFinSmart);

export default router;
