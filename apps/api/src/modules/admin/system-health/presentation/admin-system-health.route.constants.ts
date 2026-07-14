export const ADMIN_SYSTEM_HEALTH_ROUTE_PATHS = {
  ROOT: '/',
} as const;

export type AdminSystemHealthRoutePath =
  (typeof ADMIN_SYSTEM_HEALTH_ROUTE_PATHS)[keyof typeof ADMIN_SYSTEM_HEALTH_ROUTE_PATHS];
