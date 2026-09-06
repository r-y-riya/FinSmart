import { Router } from 'express';
import { demoController } from '../controllers/demo.controller.js';

const router = Router();

router.post('/simulate-movement', demoController.simulateMovement);
router.post('/simulate-outage', demoController.toggleOutage);
router.get('/outage-status', demoController.getOutageStatus);
router.post('/seed', demoController.seed);

export default router;
