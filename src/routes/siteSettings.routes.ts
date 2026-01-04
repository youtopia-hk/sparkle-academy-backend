import { Router } from 'express';
import {
  getSiteSettings,
  updateSiteSettings
} from '../controllers/siteSettings.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/roleCheck.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

router.get('/', getSiteSettings);
router.put('/', updateSiteSettings);

export default router;
