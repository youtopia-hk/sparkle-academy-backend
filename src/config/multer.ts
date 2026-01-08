import multer from 'multer';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from './constants';

// Storage configuration - Use memory storage for R2 uploads
// Files are stored in memory as Buffer objects before uploading to R2
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});
