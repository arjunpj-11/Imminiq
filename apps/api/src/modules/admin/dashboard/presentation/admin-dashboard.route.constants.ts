export const ADMIN_DASHBOARD_ROUTE_PATHS = {
  ROOT: '/',
} as const;

export type AdminDashboardRoutePath =
  (typeof ADMIN_DASHBOARD_ROUTE_PATHS)[keyof typeof ADMIN_DASHBOARD_ROUTE_PATHS];
