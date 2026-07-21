import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ApiError } from '../utils/ApiError';
import { User } from '../../infrastructure/database/models/user.model';
import { AuthToken } from '../../infrastructure/database/models/auth-token.model';

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

const assertAccountAndSessionActive = async (decoded: AuthTokenPayload) => {
  if (!decoded.sessionId) {
    throw new ApiError(401, 'Session is no longer active', 'UNAUTHORIZED');
  }

  const [user, session] = await Promise.all([
    User.findOne({ _id: decoded.userId, deletedAt: null })
      .select('status role adminStatusReason')
      .lean<{ status?: string; role?: UserRole; adminStatusReason?: string | null }>(),
    AuthToken.exists({
      _id: decoded.sessionId,
      userId: decoded.userId,
      revokedAt: null,
      deletedAt: null,
      expiresAt: { $gt: new Date() },
    }),
  ]);

  if (!user || !session) throw new ApiError(401, 'Session is no longer active', 'UNAUTHORIZED');
  if (!isUserRole(user.role) || user.role !== decoded.role) {
    throw new ApiError(
      401,
      'Your access level changed. Please sign in again.',
      'SESSION_ROLE_CHANGED'
    );
  }
  const reason = user.adminStatusReason ? ` Reason: ${user.adminStatusReason}` : '';
  if (user.status === 'paused') {
    throw new ApiError(403, `Account suspended.${reason}`, 'ACCOUNT_PAUSED');
  }
  if (user.status === 'blocked' || user.status === 'banned') {
    throw new ApiError(403, `Account blocked.${reason}`, 'ACCOUNT_BLOCKED');
  }
  if (user.status === 'deactivated') {
    throw new ApiError(403, 'Account deactivated', 'ACCOUNT_DEACTIVATED');
  }
};

const verifyAccessToken = (token: string): AuthTokenPayload => {
  let decoded: Partial<AuthTokenPayload>;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'imminiq-api',
      audience: 'imminiq-web',
    }) as Partial<AuthTokenPayload>;
  } catch {
    throw new ApiError(401, 'Invalid or expired token', 'UNAUTHORIZED');
  }

  if (!decoded.userId || !isUserRole(decoded.role) || decoded.type !== 'access') {
    throw new ApiError(401, 'Invalid token payload', 'UNAUTHORIZED');
  }
  return decoded as AuthTokenPayload;
};

export const verifyActiveAccessToken = async (token: string): Promise<AuthTokenPayload> => {
  const decoded = verifyAccessToken(token);
  await assertAccountAndSessionActive(decoded);
  return decoded;
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  if (res.locals.authenticatedAccessToken === true && req.user) {
    next();
    return;
  }

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'No token provided', 'UNAUTHORIZED');
  }

  const decoded = await verifyActiveAccessToken(token);
  req.user = {
    userId: decoded.userId,
    role: decoded.role,
    type: decoded.type,
    ...(typeof decoded.sessionId === 'string' ? { sessionId: decoded.sessionId } : {}),
  };
  res.locals.authenticatedAccessToken = true;
  next();
};

export const authenticateOptional = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  const decoded = await verifyActiveAccessToken(token);
  req.user = {
    userId: decoded.userId,
    role: decoded.role,
    type: decoded.type,
    ...(typeof decoded.sessionId === 'string' ? { sessionId: decoded.sessionId } : {}),
  };
  next();
};
