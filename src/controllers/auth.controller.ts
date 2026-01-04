import { Request, Response } from 'express';
import AdminUser from '../models/AdminUser';
import { generateToken } from '../utils/jwt.utils';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS',
        },
      });
      return;
    }

    // Find user and include password field
    const user = await AdminUser.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Account is disabled',
          code: 'ACCOUNT_DISABLED',
        },
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return response
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        code: 'LOGIN_ERROR',
      },
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      });
      return;
    }

    const user = await AdminUser.findById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user info',
        code: 'GET_USER_ERROR',
      },
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // Since we're using stateless JWT, logout is handled client-side
  // by removing the token from storage
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      });
      return;
    }

    // Validation
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Current password and new password are required',
          code: 'MISSING_FIELDS',
        },
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: {
          message: 'New password must be at least 6 characters long',
          code: 'PASSWORD_TOO_SHORT',
        },
      });
      return;
    }

    // Find user with password field
    const user = await AdminUser.findById(req.user.userId).select('+password');

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Current password is incorrect',
          code: 'INVALID_PASSWORD',
        },
      });
      return;
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to change password',
        code: 'CHANGE_PASSWORD_ERROR',
      },
    });
  }
};
