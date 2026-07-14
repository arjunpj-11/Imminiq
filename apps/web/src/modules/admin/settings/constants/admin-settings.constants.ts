import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_SETTINGS_ENDPOINTS = {
  detail: '/admin/settings',
  update: '/admin/settings',
} as const;

export const ADMIN_SETTINGS_ROUTES = {
  detail: ADMIN_ROUTES.settings,
} as const;

export const ADMIN_SETTINGS_STALE_TIME_MS = 30_000;
