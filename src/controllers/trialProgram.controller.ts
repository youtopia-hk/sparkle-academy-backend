import { Request, Response } from 'express';
import TrialProgram from '../models/TrialProgram';
import { createUniqueSlug } from '../utils/slugify.utils';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, entityId, categoryId, isActive } = req.query;

    const filter: any = {};
    if (entityId) filter.entityId = entityId;
    if (categoryId) filter.categoryId = categoryId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const programs = await TrialProgram.find(filter)
      .populate('entityId', 'name slug')
      .populate('categoryId', 'name slug')
      .populate('instructorIds', 'firstName lastName photo')
      .populate('paidProgramId', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await TrialProgram.countDocuments(filter);

    res.json({
      success: true,
      data: programs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching trial programs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch trial programs', code: 'FETCH_ERROR' }
    });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const program = await TrialProgram.findById(id)
      .populate('entityId')
      .populate('categoryId')
      .populate('instructorIds')
      .populate('paidProgramId');

    if (!program) {
      res.status(404).json({
        success: false,
        error: { message: 'Trial program not found', code: 'NOT_FOUND' }
      });
      return;
    }

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error('Error fetching trial program:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch trial program', code: 'FETCH_ERROR' }
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, ...programData } = req.body;

    // Validation
    if (!name) {
      res.status(400).json({
        success: false,
        error: { message: 'Program name is required', code: 'MISSING_NAME' }
      });
      return;
    }

    // Generate unique slug
    const slug = await createUniqueSlug(name, TrialProgram);

    // Create program with createdBy
    const program = new TrialProgram({
      name,
      slug,
      ...programData,
      createdBy: req.user?.userId
    });

    await program.save();

    // Populate and return
    await program.populate(['entityId', 'categoryId', 'instructorIds', 'paidProgramId']);

    res.status(201).json({
      success: true,
      data: program
    });
  } catch (error: any) {
    console.error('Error creating trial program:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to create trial program', code: 'CREATE_ERROR' }
    });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, ...updateData } = req.body;

    const program = await TrialProgram.findById(id);

    if (!program) {
      res.status(404).json({
        success: false,
        error: { message: 'Trial program not found', code: 'NOT_FOUND' }
      });
      return;
    }

    // If name changed, regenerate slug
    if (name && name !== program.name) {
      const slug = await createUniqueSlug(name, TrialProgram, id as string);
      updateData.slug = slug;
      updateData.name = name;
    }

    Object.assign(program, updateData);
    await program.save();

    await program.populate(['entityId', 'categoryId', 'instructorIds', 'paidProgramId']);

    res.json({
      success: true,
      data: program
    });
  } catch (error: any) {
    console.error('Error updating trial program:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to update trial program', code: 'UPDATE_ERROR' }
    });
  }
};

export const deleteProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const program = await TrialProgram.findById(id);

    if (!program) {
      res.status(404).json({
        success: false,
        error: { message: 'Trial program not found', code: 'NOT_FOUND' }
      });
      return;
    }

    await program.deleteOne();

    res.json({
      success: true,
      message: 'Trial program deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trial program:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete trial program', code: 'DELETE_ERROR' }
    });
  }
};
