import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { User } from '../../infrastructure/database/models/user.model';
import {
  SECURITY_ATTEMPT_POLICIES,
  securityAttemptCache,
} from '../../infrastructure/cache/security-attempt.cache';
import { securityAuditLogger } from '../../infrastructure/security/security-audit-logger';
import { TwoFactorAuth } from '../../infrastructure/database/models/two-factor-auth.model';

export type AdminPermission =
  | 'content:read'
  | 'content:moderate'
  | 'content:delete'
  | 'support:manage'
  | 'users:manage'
  | 'billing:manage'
  | 'operations:read'
  | 'settings:manage';

export interface IAdminActionPasswordVerifier {
  compare(password: string, hash: string): Promise<boolean>;
}

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

export const requireSuperAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'superadmin') {
    throw new ApiError(403, 'Superadmin access required', 'SUPERADMIN_REQUIRED');
  }
  next();
};

export const requireStaffTwoFactor = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const role = req.user?.role;
  if (!role || !['moderator', 'admin', 'superadmin'].includes(role)) {
    next();
    return;
  }

  const enabled = await TwoFactorAuth.exists({
    userId: req.user!.userId,
    status: 'active',
    deletedAt: null,
  });
  if (!enabled) {
    throw new ApiError(
      403,
      'Two-factor authentication is required for staff access. Enable it in Security settings.',
      'STAFF_TWO_FACTOR_REQUIRED'
    );
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

export const createRequirePrivilegedMfa =
  (passwordVerifier: IAdminActionPasswordVerifier) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role === 'superadmin') {
      next();
      return;
    }
    try {
      const actorId = req.user?.userId;
      if (!actorId) {
        throw new ApiError(401, 'Authentication is required', 'UNAUTHORIZED');
      }
      if (await securityAttemptCache.isBlocked('admin_action_password', actorId)) {
        const retryAfter = await securityAttemptCache.getRetryAfterSeconds(
          'admin_action_password',
          actorId
        );
        await securityAuditLogger.record({
          userId: actorId,
          eventType: 'admin_action_password_blocked',
          outcome: 'blocked',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: { role: req.user?.role, retryAfterSeconds: retryAfter },
        });
        throw new ApiError(
          429,
          `Too many incorrect action-password attempts. Try again in ${Math.max(retryAfter, 1)} seconds.`,
          'ADMIN_ACTION_PASSWORD_BLOCKED'
        );
      }
      const admin = await User.findOne({
        _id: actorId,
        role: { $in: ['admin', 'moderator'] },
        status: 'active',
        deletedAt: null,
      }).select('+adminActionPasswordHash');
      if (!admin?.adminActionPasswordHash) {
        throw new ApiError(
          403,
          'Ask a super admin to set your admin action password before making protected changes',
          'ADMIN_ACTION_PASSWORD_NOT_SET'
        );
      }

      const password = req.get('x-admin-action-password');
      if (!password) {
        throw new ApiError(
          403,
          'Enter the admin action password assigned by your super admin',
          'ADMIN_ACTION_PASSWORD_REQUIRED'
        );
      }
      const valid = await passwordVerifier.compare(password, admin.adminActionPasswordHash);
      if (!valid) {
        const attempt = await securityAttemptCache.recordFailure(
          'admin_action_password',
          actorId,
          SECURITY_ATTEMPT_POLICIES.twoFactorVerification
        );
        await securityAuditLogger.record({
          userId: actorId,
          eventType: 'admin_action_password_failed',
          outcome: attempt.blocked ? 'blocked' : 'failure',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: { role: req.user?.role, remainingAttempts: attempt.remainingAttempts },
        });
        throw new ApiError(
          attempt.blocked ? 429 : 403,
          attempt.blocked
            ? 'Too many incorrect attempts. Action-password verification is temporarily locked.'
            : `The admin action password is incorrect. ${attempt.remainingAttempts} attempts remaining.`,
          attempt.blocked ? 'ADMIN_ACTION_PASSWORD_BLOCKED' : 'ADMIN_ACTION_PASSWORD_INVALID'
        );
      }
      await securityAttemptCache.clear('admin_action_password', actorId);
      next();
    } catch (error) {
      next(error);
    }
  };

export type PrivilegedAdminMiddleware = ReturnType<typeof createRequirePrivilegedMfa>;
