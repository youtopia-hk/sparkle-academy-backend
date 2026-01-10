import { Request, Response } from 'express';
import PaidProgram from '../models/PaidProgram';
import TrialProgram from '../models/TrialProgram';
import Entity from '../models/Entity';
import Category from '../models/Category';
import Instructor from '../models/Instructor';
import Testimonial from '../models/Testimonial';
import SiteSettings from '../models/SiteSettings';

// GET /api/public/programs - Combined paid + trial with filters
export const getPublicPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityId, categoryId, type, isFeatured } = req.query;

    const filter: any = { isActive: true };
    if (entityId) filter.entityId = entityId;
    if (categoryId) filter.categoryId = categoryId;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    let programs: any[] = [];

    // Fetch paid programs if type is 'paid' or 'all' or not specified
    if (type === 'paid' || type === 'all' || !type) {
      const paidPrograms = await PaidProgram.find(filter)
        .populate('entityId', 'name slug')
        .populate('categoryId', 'name slug')
        .populate('instructorIds', 'firstName lastName photo')
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

      programs.push(...paidPrograms.map(p => ({ ...p, programType: 'paid' })));
    }

    // Fetch trial programs if type is 'trial' or 'all' or not specified
    if (type === 'trial' || type === 'all' || !type) {
      const trialFilter = { ...filter };
      delete trialFilter.isFeatured; // Trial programs don't have isFeatured

      const trialPrograms = await TrialProgram.find(trialFilter)
        .populate('entityId', 'name slug')
        .populate('categoryId', 'name slug')
        .populate('instructorIds', 'firstName lastName photo')
        .populate('paidProgramId', 'name slug')
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

      programs.push(...trialPrograms.map(p => ({ ...p, programType: 'trial' })));
    }

    // Sort by displayOrder
    programs.sort((a, b) => a.displayOrder - b.displayOrder);

    res.json({
      success: true,
      data: programs,
    });
  } catch (error) {
    console.error('Error fetching public programs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch programs',
        code: 'FETCH_ERROR',
      },
    });
  }
};

// GET /api/public/program/:type/:slug - Get program by slug
export const getProgramBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, slug } = req.params;

    if (type !== 'paid' && type !== 'trial') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid program type. Must be "paid" or "trial"',
          code: 'INVALID_TYPE',
        },
      });
      return;
    }

    let program;

    if (type === 'paid') {
      program = await PaidProgram.findOne({ slug, isActive: true })
        .populate('entityId')
        .populate('categoryId')
        .populate('instructorIds');
    } else {
      program = await TrialProgram.findOne({ slug, isActive: true })
        .populate('entityId')
        .populate('categoryId')
        .populate('instructorIds')
        .populate('paidProgramId');
    }

    if (!program) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Program not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { ...program.toObject(), programType: type },
    });
  } catch (error) {
    console.error('Error fetching program by slug:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch program',
        code: 'FETCH_ERROR',
      },
    });
  }
};

// GET /api/public/entities - Get all active entities
export const getPublicEntities = async (req: Request, res: Response): Promise<void> => {
  try {
    const entities = await Entity.find({ isActive: true })
      .sort({ displayOrder: 1 });

    res.json({
      success: true,
      data: entities,
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch entities',
        code: 'FETCH_ERROR',
      },
    });
  }
};

// GET /api/public/categories - Get categories (optionally filtered by entity)
export const getPublicCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityId } = req.query;

    const filter: any = { isActive: true };
    if (entityId) filter.entityId = entityId;

    const categories = await Category.find(filter)
      .populate('entityId', 'name slug')
      .sort({ displayOrder: 1 });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch categories',
        code: 'FETCH_ERROR',
      },
    });
  }
};

// GET /api/public/instructors - Get all active instructors
export const getPublicInstructors = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructors = await Instructor.find({ isActive: true })
      .sort({ displayOrder: 1 });

    res.json({
      success: true,
      data: instructors,
    });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch instructors',
        code: 'FETCH_ERROR',
      },
    });
  }
};

// GET /api/public/instructors/:slug - Get instructor by slug
export const getPublicInstructorBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const instructor = await Instructor.findOne({ slug, isActive: true });

    if (!instructor) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Instructor not found',
          code: 'NOT_FOUND',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch instructor',
        code: 'FETCH_ERROR',
      },
    });
  }
};

// GET /api/public/testimonials - Get featured testimonials
export const getPublicTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await Testimonial.find({ isActive: true, isFeatured: true })
      .populate('programId', 'name slug')
      .sort({ displayOrder: 1 })
      .limit(10);

    res.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch testimonials',
        code: 'FETCH_ERROR',
      },
    });
  }
};

// GET /api/public/site-settings - Get public site settings
export const getPublicSiteSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await SiteSettings.findOne();

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch site settings',
        code: 'FETCH_ERROR',
      },
    });
  }
};
