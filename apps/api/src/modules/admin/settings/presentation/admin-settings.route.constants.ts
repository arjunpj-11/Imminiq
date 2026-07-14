export const ADMIN_SETTINGS_ROUTE_PATHS = {
  ROOT: '/',
} as const;

export type AdminSettingsRoutePath =
  (typeof ADMIN_SETTINGS_ROUTE_PATHS)[keyof typeof ADMIN_SETTINGS_ROUTE_PATHS];
