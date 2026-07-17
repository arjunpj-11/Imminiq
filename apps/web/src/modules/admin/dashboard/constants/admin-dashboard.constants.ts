import { ADMIN_ROUTES } from "../../../../routes/config/route-paths";

export const ADMIN_DASHBOARD_ENDPOINTS = {
  overview: "/admin/dashboard",
} as const;
export const ADMIN_DASHBOARD_ROUTES = {
  overview: ADMIN_ROUTES.dashboard,
} as const;

export const ADMIN_DASHBOARD_STALE_TIME_MS = 15_000;
export const ADMIN_DASHBOARD_REFETCH_INTERVAL_MS = 30_000;
