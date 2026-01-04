import { Router } from 'express';
import {
  getPublicPrograms,
  getProgramBySlug,
  getPublicEntities,
  getPublicCategories,
  getPublicInstructors,
  getPublicTestimonials,
  getPublicSiteSettings
} from '../controllers/public.controller';

const router = Router();

// All routes are public - no authentication required
router.get('/programs', getPublicPrograms);
router.get('/program/:type/:slug', getProgramBySlug);
router.get('/entities', getPublicEntities);
router.get('/categories', getPublicCategories);
router.get('/instructors', getPublicInstructors);
router.get('/testimonials', getPublicTestimonials);
router.get('/site-settings', getPublicSiteSettings);

export default router;
