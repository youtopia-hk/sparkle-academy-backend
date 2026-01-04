import { Router } from 'express';
import { login, getMe, logout, changePassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/change-password', authMiddleware, changePassword);

export default router;
