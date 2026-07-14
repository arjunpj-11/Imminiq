export const ADMIN_USERS_ROUTE_PATHS = {
  ROOT: '/',
  DETAIL: '/:userId',
  STATUS: '/:userId/status',
} as const;

export type AdminUsersRoutePath =
  (typeof ADMIN_USERS_ROUTE_PATHS)[keyof typeof ADMIN_USERS_ROUTE_PATHS];
