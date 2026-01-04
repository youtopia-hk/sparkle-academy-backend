import { Request, Response } from 'express';
import Testimonial from '../models/Testimonial';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, isActive, isFeatured, programId } = req.query;

    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (programId) filter.programId = programId;

    const skip = (Number(page) - 1) * Number(limit);

    const testimonials = await Testimonial.find(filter)
      .populate({
        path: 'programId',
        select: 'name slug'
      })
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Testimonial.countDocuments(filter);

    res.json({
      success: true,
      data: testimonials,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch testimonials', code: 'FETCH_ERROR' }
    });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id)
      .populate({
        path: 'programId',
        select: 'name slug'
      });

    if (!testimonial) {
      res.status(404).json({
        success: false,
        error: { message: 'Testimonial not found', code: 'NOT_FOUND' }
      });
      return;
    }

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch testimonial', code: 'FETCH_ERROR' }
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonialData = req.body;

    const testimonial = new Testimonial(testimonialData);
    await testimonial.save();

    // Populate and return
    await testimonial.populate({
      path: 'programId',
      select: 'name slug'
    });

    res.status(201).json({
      success: true,
      data: testimonial
    });
  } catch (error: any) {
    console.error('Error creating testimonial:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to create testimonial', code: 'CREATE_ERROR' }
    });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      res.status(404).json({
        success: false,
        error: { message: 'Testimonial not found', code: 'NOT_FOUND' }
      });
      return;
    }

    Object.assign(testimonial, updateData);
    await testimonial.save();

    await testimonial.populate({
      path: 'programId',
      select: 'name slug'
    });

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error: any) {
    console.error('Error updating testimonial:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to update testimonial', code: 'UPDATE_ERROR' }
    });
  }
};

export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      res.status(404).json({
        success: false,
        error: { message: 'Testimonial not found', code: 'NOT_FOUND' }
      });
      return;
    }

    await testimonial.deleteOne();

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete testimonial', code: 'DELETE_ERROR' }
    });
  }
};
