import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_AUDIT_LOGS_ENDPOINTS = {
  list: '/admin/audit-logs',
} as const;

export const ADMIN_AUDIT_LOGS_ROUTES = {
  list: ADMIN_ROUTES.auditLogs,
} as const;

export const ADMIN_AUDIT_LOGS_STALE_TIME_MS = 15_000;
export const ADMIN_AUDIT_LOGS_EXPORT_PAGE_SIZE = 100;
