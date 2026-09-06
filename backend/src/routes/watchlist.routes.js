import { Router } from 'express';
import { watchlistController } from '../controllers/watchlist.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', watchlistController.getWatchlist);
router.get('/all', watchlistController.getAllWatchlists);
router.post('/:id/stocks', watchlistController.addStock);
router.delete('/:id/stocks/:symbol', watchlistController.removeStock);

export default router;
