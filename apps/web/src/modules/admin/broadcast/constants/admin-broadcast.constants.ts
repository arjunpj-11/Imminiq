import { ADMIN_ROUTES } from "../../../../routes/config/route-paths";

export const ADMIN_BROADCAST_ENDPOINTS = {
  list: "/admin/broadcasts",
  create: "/admin/broadcasts",
} as const;

export const ADMIN_BROADCAST_ROUTES = {
  list: ADMIN_ROUTES.broadcast,
} as const;

export const ADMIN_BROADCAST_STALE_TIME_MS = 15_000;
export const ADMIN_BROADCAST_PAGE_SIZE = 5;
