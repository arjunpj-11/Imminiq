import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { TwoFactorAuth } from '../../infrastructure/database/models/two-factor-auth.model';
import { env } from '../../config/env';

export type AdminPermission =
  | 'content:read'
  | 'content:moderate'
  | 'content:delete'
  | 'support:manage'
  | 'users:manage'
  | 'billing:manage'
  | 'operations:read'
  | 'settings:manage';

const permissionsByRole: Record<'moderator' | 'admin' | 'superadmin', AdminPermission[]> = {
  moderator: ['content:read', 'content:moderate', 'support:manage'],
  admin: [
    'content:read',
    'content:moderate',
    'content:delete',
    'support:manage',
    'users:manage',
    'billing:manage',
    'operations:read',
    'settings:manage',
  ],
  superadmin: [
    'content:read',
    'content:moderate',
    'content:delete',
    'support:manage',
    'users:manage',
    'billing:manage',
    'operations:read',
    'settings:manage',
  ],
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const role = req.user?.role;

  if (!role || !['admin', 'superadmin'].includes(role)) {
    throw new ApiError(403, 'Admin access required', 'FORBIDDEN');
  }

  next();
};

export const requireAdminPermission = (permission: AdminPermission) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (
      !role ||
      !['moderator', 'admin', 'superadmin'].includes(role) ||
      !permissionsByRole[role as keyof typeof permissionsByRole].includes(permission)
    ) {
      throw new ApiError(403, 'You do not have permission to perform this admin action', 'FORBIDDEN');
    }
    next();
  };

export const requirePrivilegedMfa = async (req: Request, _res: Response, next: NextFunction) => {
  if (env.NODE_ENV !== 'production') return next();
  try {
    const enabled = await TwoFactorAuth.exists({
      userId: req.user?.userId,
      status: 'active',
      deletedAt: null,
    });
    if (!enabled) {
      throw new ApiError(
        403,
        'Enable two-factor authentication before performing this privileged admin action',
        'ADMIN_MFA_REQUIRED'
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
