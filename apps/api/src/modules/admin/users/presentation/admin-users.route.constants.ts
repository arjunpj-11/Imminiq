export const ADMIN_USERS_ROUTE_PATHS = {
  ROOT: '/',
  APPEALS: '/appeals',
  APPEAL_DETAIL: '/appeals/:appealId',
  DETAIL: '/:userId',
  STATUS: '/:userId/status',
  MESSAGE: '/:userId/message',
  SESSION: '/:userId/sessions/:sessionId',
  ROLE: '/:userId/role',
} as const;

export type AdminUsersRoutePath =
  (typeof ADMIN_USERS_ROUTE_PATHS)[keyof typeof ADMIN_USERS_ROUTE_PATHS];
