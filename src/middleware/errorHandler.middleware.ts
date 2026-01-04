import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details,
      },
    } as ErrorResponse);
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    res.status(400).json({
      success: false,
      error: {
        message: `${field} already exists`,
        code: 'DUPLICATE_ERROR',
      },
    } as ErrorResponse);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        message: 'Invalid ID format',
        code: 'INVALID_ID',
      },
    } as ErrorResponse);
    return;
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      success: false,
      error: {
        message: 'File size exceeds limit (5MB)',
        code: 'FILE_TOO_LARGE',
      },
    } as ErrorResponse);
    return;
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
    },
  } as ErrorResponse);
};
