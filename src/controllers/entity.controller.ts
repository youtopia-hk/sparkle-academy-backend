import { Request, Response } from 'express';
import Entity from '../models/Entity';
import { createUniqueSlug } from '../utils/slugify.utils';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const entities = await Entity.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Entity.countDocuments(filter);

    res.json({
      success: true,
      data: entities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch entities', code: 'FETCH_ERROR' }
    });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const entity = await Entity.findById(id);

    if (!entity) {
      res.status(404).json({
        success: false,
        error: { message: 'Entity not found', code: 'NOT_FOUND' }
      });
      return;
    }

    res.json({
      success: true,
      data: entity
    });
  } catch (error) {
    console.error('Error fetching entity:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch entity', code: 'FETCH_ERROR' }
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, ...entityData } = req.body;

    // Validation
    if (!name) {
      res.status(400).json({
        success: false,
        error: { message: 'Entity name is required', code: 'MISSING_NAME' }
      });
      return;
    }

    // Generate unique slug
    const slug = await createUniqueSlug(name, Entity);

    // Create entity
    const entity = new Entity({
      name,
      slug,
      ...entityData
    });

    await entity.save();

    res.status(201).json({
      success: true,
      data: entity
    });
  } catch (error: any) {
    console.error('Error creating entity:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to create entity', code: 'CREATE_ERROR' }
    });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, ...updateData } = req.body;

    const entity = await Entity.findById(id);

    if (!entity) {
      res.status(404).json({
        success: false,
        error: { message: 'Entity not found', code: 'NOT_FOUND' }
      });
      return;
    }

    // If name changed, regenerate slug
    if (name && name !== entity.name) {
      const slug = await createUniqueSlug(name, Entity, id);
      updateData.slug = slug;
      updateData.name = name;
    }

    Object.assign(entity, updateData);
    await entity.save();

    res.json({
      success: true,
      data: entity
    });
  } catch (error: any) {
    console.error('Error updating entity:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to update entity', code: 'UPDATE_ERROR' }
    });
  }
};

export const deleteEntity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const entity = await Entity.findById(id);

    if (!entity) {
      res.status(404).json({
        success: false,
        error: { message: 'Entity not found', code: 'NOT_FOUND' }
      });
      return;
    }

    await entity.deleteOne();

    res.json({
      success: true,
      message: 'Entity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting entity:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete entity', code: 'DELETE_ERROR' }
    });
  }
};
