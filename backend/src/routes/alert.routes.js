import { Router } from 'express';
import { alertController } from '../controllers/alert.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', alertController.getAlerts);
router.post('/', alertController.createAlert);
router.patch('/:id', alertController.updateAlert);
router.delete('/:id', alertController.deleteAlert);

export default router;
