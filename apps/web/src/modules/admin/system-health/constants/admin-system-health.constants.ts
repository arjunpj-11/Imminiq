import { ADMIN_ROUTES } from "../../../../routes/config/route-paths";

export const ADMIN_SYSTEM_HEALTH_ENDPOINTS = {
  overview: "/admin/system-health",
} as const;

export const ADMIN_SYSTEM_HEALTH_ROUTES = {
  overview: ADMIN_ROUTES.systemHealth,
} as const;

export const ADMIN_SYSTEM_HEALTH_REFETCH_INTERVAL_MS = 15_000;
