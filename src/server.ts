// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import connectDB from './config/database';
import { errorHandler } from './middleware/errorHandler.middleware';
import authRoutes from './routes/auth.routes';
import adminUserRoutes from './routes/adminUser.routes';
import siteSettingsRoutes from './routes/siteSettings.routes';
import entityRoutes from './routes/entity.routes';
import categoryRoutes from './routes/category.routes';
import paidProgramRoutes from './routes/paidProgram.routes';
import trialProgramRoutes from './routes/trialProgram.routes';
import instructorRoutes from './routes/instructor.routes';
import testimonialRoutes from './routes/testimonial.routes';
import mediaRoutes from './routes/media.routes';
import contactRoutes from './routes/contact.routes';
import publicRoutes from './routes/public.routes';

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Trust proxy for Render/reverse proxy deployments
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN?.split(',')
    : true, // Allow all origins in development
  credentials: true,
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs (development setting)
  message: 'Too many login attempts, please try again later',
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Healthz endpoint for uptime monitoring (UptimeRobot)
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
// Authentication routes (with rate limiting)
app.use('/api/auth', authLimiter, authRoutes);

// Public routes (no authentication)
app.use('/api/public', publicRoutes);
app.use('/api/contact', contactRoutes);

// Admin routes (authentication required)
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/site-settings', siteSettingsRoutes);
app.use('/api/admin/entities', entityRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/programs/paid', paidProgramRoutes);
app.use('/api/admin/programs/trial', trialProgramRoutes);
app.use('/api/admin/instructors', instructorRoutes);
app.use('/api/admin/testimonials', testimonialRoutes);
app.use('/api/admin/media', mediaRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
