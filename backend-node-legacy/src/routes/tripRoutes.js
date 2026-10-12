import { Router } from 'express';
import { TripController } from '../controllers/tripController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, TripController.getAll);
router.get('/:id', authenticate, TripController.getById);
router.post('/dispatch', authenticate, requireRole(['SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER']), TripController.dispatch);
router.post('/:id/complete', authenticate, requireRole(['SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'DRIVER']), TripController.complete);

export default router;
