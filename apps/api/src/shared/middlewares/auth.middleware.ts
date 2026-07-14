import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ApiError } from '../utils/ApiError';

type UserRole = 'user' | 'admin' | 'moderator' | 'superadmin';

type AuthTokenPayload = {
  userId: string;
  role: UserRole;
  type: 'access';
  sessionId?: string;
};

const isUserRole = (role: unknown): role is UserRole => {
  return typeof role === 'string' && ['user', 'admin', 'moderator', 'superadmin'].includes(role);
};

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'No token provided', 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'imminiq-api',
      audience: 'imminiq-web',
    }) as Partial<AuthTokenPayload>;

    if (!decoded.userId || !isUserRole(decoded.role) || decoded.type !== 'access') {
      throw new ApiError(401, 'Invalid token payload', 'UNAUTHORIZED');
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      type: decoded.type,
      ...(typeof decoded.sessionId === 'string' ? { sessionId: decoded.sessionId } : {}),
    };

    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired token', 'UNAUTHORIZED');
  }
};

export const authenticateOptional = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'imminiq-api',
      audience: 'imminiq-web',
    }) as Partial<AuthTokenPayload>;

    if (!decoded.userId || !isUserRole(decoded.role) || decoded.type !== 'access') {
      throw new ApiError(401, 'Invalid token payload', 'UNAUTHORIZED');
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      type: decoded.type,
      ...(typeof decoded.sessionId === 'string' ? { sessionId: decoded.sessionId } : {}),
    };

    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired token', 'UNAUTHORIZED');
  }
};
