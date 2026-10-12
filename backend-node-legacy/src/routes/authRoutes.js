import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', AuthController.login);
router.get('/drivers', authenticate, AuthController.getDrivers);
router.get('/me', authenticate, AuthController.getMe);

export default router;
