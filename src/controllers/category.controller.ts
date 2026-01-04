import { Request, Response } from 'express';
import Category from '../models/Category';
import { createUniqueSlug } from '../utils/slugify.utils';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, entityId, isActive } = req.query;

    const filter: any = {};
    if (entityId) filter.entityId = entityId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const categories = await Category.find(filter)
      .populate('entityId', 'name slug')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Category.countDocuments(filter);

    res.json({
      success: true,
      data: categories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch categories', code: 'FETCH_ERROR' }
    });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate('entityId');

    if (!category) {
      res.status(404).json({
        success: false,
        error: { message: 'Category not found', code: 'NOT_FOUND' }
      });
      return;
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch category', code: 'FETCH_ERROR' }
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, ...categoryData } = req.body;

    // Validation
    if (!name) {
      res.status(400).json({
        success: false,
        error: { message: 'Category name is required', code: 'MISSING_NAME' }
      });
      return;
    }

    // Generate unique slug
    const slug = await createUniqueSlug(name, Category);

    // Create category
    const category = new Category({
      name,
      slug,
      ...categoryData
    });

    await category.save();

    // Populate and return
    await category.populate('entityId');

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    console.error('Error creating category:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to create category', code: 'CREATE_ERROR' }
    });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, ...updateData } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: { message: 'Category not found', code: 'NOT_FOUND' }
      });
      return;
    }

    // If name changed, regenerate slug
    if (name && name !== category.name) {
      const slug = await createUniqueSlug(name, Category, id);
      updateData.slug = slug;
      updateData.name = name;
    }

    Object.assign(category, updateData);
    await category.save();

    await category.populate('entityId');

    res.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    console.error('Error updating category:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to update category', code: 'UPDATE_ERROR' }
    });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: { message: 'Category not found', code: 'NOT_FOUND' }
      });
      return;
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete category', code: 'DELETE_ERROR' }
    });
  }
};
