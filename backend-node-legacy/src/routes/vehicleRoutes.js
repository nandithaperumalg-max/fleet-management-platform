import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, VehicleController.getAll);
router.get('/available', authenticate, VehicleController.getAvailable);
router.get('/:id', authenticate, VehicleController.getById);
router.post('/', authenticate, requireRole(['SUPER_ADMIN', 'FLEET_MANAGER']), VehicleController.create);
router.patch('/:id/status', authenticate, requireRole(['SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER']), VehicleController.updateStatus);

export default router;
