import type { IAuthUser } from '../store/useAuthStore';

export type AuthRole = IAuthUser['role'];

export const STAFF_ROLES = ['moderator', 'admin', 'superadmin'] as const satisfies readonly AuthRole[];
export const ADMIN_ROLES = ['admin', 'superadmin'] as const satisfies readonly AuthRole[];

export const isStaffRole = (role?: string | null): role is (typeof STAFF_ROLES)[number] =>
  STAFF_ROLES.some((staffRole) => staffRole === role);

export const isAdminRole = (role?: string | null): role is (typeof ADMIN_ROLES)[number] =>
  ADMIN_ROLES.some((adminRole) => adminRole === role);
