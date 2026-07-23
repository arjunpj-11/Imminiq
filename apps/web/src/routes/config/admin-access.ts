import { ADMIN_ROLES, STAFF_ROLES } from '../../lib/auth-roles';
import type { AuthRole } from '../../lib/auth-roles';

export const ADMIN_ROUTE_ROLES = {
  dashboard: STAFF_ROLES,
  users: ADMIN_ROLES,
  trackers: STAFF_ROLES,
  mockTests: STAFF_ROLES,
  analytics: ADMIN_ROLES,
  broadcast: ADMIN_ROLES,
  subscriptions: ADMIN_ROLES,
  auditLogs: ADMIN_ROLES,
  systemHealth: ADMIN_ROLES,
  aiTokenSpend: ADMIN_ROLES,
  supportTickets: STAFF_ROLES,
  settings: ADMIN_ROLES,
} as const;

export const canAccessAdminRoute = (roles: readonly AuthRole[], role?: AuthRole) =>
  Boolean(role && roles.includes(role));
