import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
  deleteTestimonial
} from '../controllers/testimonial.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/roleCheck.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteTestimonial);

export default router;
