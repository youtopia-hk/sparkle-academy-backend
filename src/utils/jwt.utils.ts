import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'super_admin' | 'admin';
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
