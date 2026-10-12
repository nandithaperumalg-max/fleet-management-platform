import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenanceController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/work-orders', authenticate, MaintenanceController.getAllWorkOrders);
router.get('/work-orders/:id', authenticate, MaintenanceController.getWorkOrderById);
router.post('/work-orders', authenticate, requireRole(['SUPER_ADMIN', 'FLEET_MANAGER', 'MECHANIC']), MaintenanceController.createWorkOrder);
router.patch('/work-orders/:id/status', authenticate, requireRole(['SUPER_ADMIN', 'FLEET_MANAGER', 'MECHANIC']), MaintenanceController.updateStatus);
router.get('/parts', authenticate, MaintenanceController.getParts);
router.post('/evaluate', authenticate, requireRole(['SUPER_ADMIN', 'FLEET_MANAGER']), MaintenanceController.triggerEvaluation);

export default router;
