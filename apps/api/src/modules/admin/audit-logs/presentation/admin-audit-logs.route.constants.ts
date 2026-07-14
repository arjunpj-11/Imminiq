export const ADMIN_AUDIT_LOGS_ROUTE_PATHS = {
  ROOT: '/',
} as const;

export type AdminAuditLogsRoutePath =
  (typeof ADMIN_AUDIT_LOGS_ROUTE_PATHS)[keyof typeof ADMIN_AUDIT_LOGS_ROUTE_PATHS];
