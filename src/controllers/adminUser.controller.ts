import { Request, Response } from 'express';
import AdminUser from '../models/AdminUser';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const users = await AdminUser.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AdminUser.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch admin users', code: 'FETCH_ERROR' }
    });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await AdminUser.findById(id).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Admin user not found', code: 'NOT_FOUND' }
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching admin user:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch admin user', code: 'FETCH_ERROR' }
    });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        error: { message: 'Email, password, first name, and last name are required', code: 'MISSING_FIELDS' }
      });
      return;
    }

    // Check if user already exists
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { message: 'User with this email already exists', code: 'USER_EXISTS' }
      });
      return;
    }

    // Create user (password will be hashed by pre-save hook)
    const user = new AdminUser({
      email,
      password,
      firstName,
      lastName,
      role,
      createdBy: req.user?.userId
    });

    await user.save();

    // Return user without password
    const userObject: any = user.toObject();
    delete userObject.password;

    res.status(201).json({
      success: true,
      data: userObject
    });
  } catch (error: any) {
    console.error('Error creating admin user:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to create admin user', code: 'CREATE_ERROR' }
    });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { password, ...updateData } = req.body;

    const user = await AdminUser.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Admin user not found', code: 'NOT_FOUND' }
      });
      return;
    }

    // Update fields
    Object.assign(user, updateData);

    // If password is provided, update it (will be hashed by pre-save hook)
    if (password) {
      user.password = password;
    }

    await user.save();

    // Return user without password
    const userObject: any = user.toObject();
    delete userObject.password;

    res.json({
      success: true,
      data: userObject
    });
  } catch (error: any) {
    console.error('Error updating admin user:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to update admin user', code: 'UPDATE_ERROR' }
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user?.userId === id) {
      res.status(403).json({
        success: false,
        error: { message: 'You cannot delete your own account', code: 'CANNOT_DELETE_SELF' }
      });
      return;
    }

    const user = await AdminUser.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Admin user not found', code: 'NOT_FOUND' }
      });
      return;
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'Admin user deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete admin user', code: 'DELETE_ERROR' }
    });
  }
};
