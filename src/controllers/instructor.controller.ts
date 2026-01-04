import { Request, Response } from 'express';
import Instructor from '../models/Instructor';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const instructors = await Instructor.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Instructor.countDocuments(filter);

    res.json({
      success: true,
      data: instructors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch instructors', code: 'FETCH_ERROR' }
    });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findById(id);

    if (!instructor) {
      res.status(404).json({
        success: false,
        error: { message: 'Instructor not found', code: 'NOT_FOUND' }
      });
      return;
    }

    res.json({
      success: true,
      data: instructor
    });
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch instructor', code: 'FETCH_ERROR' }
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructorData = req.body;

    const instructor = new Instructor(instructorData);
    await instructor.save();

    res.status(201).json({
      success: true,
      data: instructor
    });
  } catch (error: any) {
    console.error('Error creating instructor:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to create instructor', code: 'CREATE_ERROR' }
    });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const instructor = await Instructor.findById(id);

    if (!instructor) {
      res.status(404).json({
        success: false,
        error: { message: 'Instructor not found', code: 'NOT_FOUND' }
      });
      return;
    }

    Object.assign(instructor, updateData);
    await instructor.save();

    res.json({
      success: true,
      data: instructor
    });
  } catch (error: any) {
    console.error('Error updating instructor:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to update instructor', code: 'UPDATE_ERROR' }
    });
  }
};

export const deleteInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findById(id);

    if (!instructor) {
      res.status(404).json({
        success: false,
        error: { message: 'Instructor not found', code: 'NOT_FOUND' }
      });
      return;
    }

    await instructor.deleteOne();

    res.json({
      success: true,
      message: 'Instructor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete instructor', code: 'DELETE_ERROR' }
    });
  }
};
