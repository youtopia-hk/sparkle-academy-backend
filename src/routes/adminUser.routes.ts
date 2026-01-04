import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
  deleteUser
} from '../controllers/adminUser.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireSuperAdmin } from '../middleware/roleCheck.middleware';

const router = Router();

// All routes require authentication and super admin role
router.use(authMiddleware);
router.use(requireSuperAdmin);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteUser);

export default router;
