import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/kpis', authenticate, AnalyticsController.getKPIs);
router.get('/utilization', authenticate, AnalyticsController.getUtilization);
router.get('/upcoming-maintenance', authenticate, AnalyticsController.getUpcomingMaintenance);
router.get('/fuel-efficiency', authenticate, AnalyticsController.getFuelEfficiency);

export default router;
