import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.utils';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          code: 'NO_TOKEN',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
        },
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Authentication error',
        code: 'AUTH_ERROR',
      },
    });
    return;
  }
};
