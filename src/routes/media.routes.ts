import { Router } from 'express';
import {
  uploadImage,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia
} from '../controllers/media.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/roleCheck.middleware';
import { upload } from '../config/multer';

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

router.post('/upload', upload.single('image'), uploadImage);
router.get('/', getAllMedia);
router.get('/:id', getMediaById);
router.put('/:id', updateMedia);
router.delete('/:id', deleteMedia);

export default router;
