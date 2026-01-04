import { Request, Response, NextFunction } from 'express';
import { USER_ROLES } from '../config/constants';

export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required',
        code: 'NOT_AUTHENTICATED',
      },
    });
    return;
  }

  if (req.user.role !== USER_ROLES.SUPER_ADMIN) {
    res.status(403).json({
      success: false,
      error: {
        message: 'Super admin access required',
        code: 'FORBIDDEN',
      },
    });
    return;
  }

  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required',
        code: 'NOT_AUTHENTICATED',
      },
    });
    return;
  }

  if (req.user.role !== USER_ROLES.SUPER_ADMIN && req.user.role !== USER_ROLES.ADMIN) {
    res.status(403).json({
      success: false,
      error: {
        message: 'Admin access required',
        code: 'FORBIDDEN',
      },
    });
    return;
  }

  next();
};
