import { Router } from 'express';
import { stockController } from '../controllers/stock.controller.js';

const router = Router();

router.get('/search', stockController.search);
router.get('/:symbol', stockController.getStock);
router.get('/:symbol/history', stockController.getHistory);
router.get('/:symbol/news', stockController.getNews);
router.get('/:symbol/changes', stockController.getChanges);

export default router;
