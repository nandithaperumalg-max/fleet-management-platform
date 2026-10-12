import { Router } from 'express';
import { FuelController } from '../controllers/fuelController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, FuelController.getAll);
router.post('/', authenticate, FuelController.logFuel);

export default router;
