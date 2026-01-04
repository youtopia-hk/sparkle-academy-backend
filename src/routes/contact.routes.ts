import { Router } from 'express';
import { submitContactForm } from '../controllers/contact.controller';

const router = Router();

// Public route - no authentication required
router.post('/', submitContactForm);

export default router;
