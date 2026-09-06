import { Router } from 'express';
import { changeController } from '../controllers/change.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', changeController.getAllChanges);
router.get('/since-last-visit', authenticateToken, changeController.getChangesSinceLastVisit);

export default router;
