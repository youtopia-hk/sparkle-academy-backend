export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
} as const;

export const DELIVERY_FORMATS = {
  ONLINE: 'online',
  IN_PERSON: 'in-person',
  HYBRID: 'hybrid',
} as const;

export const TESTIMONIAL_ROLES = {
  STUDENT: 'student',
  PARENT: 'parent',
} as const;

export const PROGRAM_TYPES = {
  PAID: 'paid',
  TRIAL: 'trial',
} as const;

export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
} as const;

export const DEFAULT_CURRENCY = 'USD';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
