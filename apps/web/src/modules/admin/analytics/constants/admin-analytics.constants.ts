import { ADMIN_ROUTES } from "../../../../routes/config/route-paths";

export const ADMIN_ANALYTICS_ENDPOINTS = {
  overview: "/admin/analytics",
} as const;

export const ADMIN_ANALYTICS_ROUTES = {
  overview: ADMIN_ROUTES.activity,
} as const;

export const ADMIN_ANALYTICS_STALE_TIME_MS = 30_000;
