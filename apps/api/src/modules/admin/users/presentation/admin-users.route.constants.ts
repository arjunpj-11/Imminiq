export const ADMIN_USERS_ROUTE_PATHS = {
  ROOT: '/',
  EXPORT: '/export.csv',
  BULK_STATUS: '/bulk/status',
  APPEALS: '/appeals',
  APPEAL_DETAIL: '/appeals/:appealId',
  PRIVACY_REQUESTS: '/privacy-requests',
  PRIVACY_REQUEST_DETAIL: '/privacy-requests/:requestId',
  DETAIL: '/:userId',
  STATUS: '/:userId/status',
  MESSAGE: '/:userId/message',
  SESSION: '/:userId/sessions/:sessionId',
  ROLE: '/:userId/role',
  NOTES: '/:userId/notes',
  NOTE_DETAIL: '/:userId/notes/:noteId',
  TAGS: '/:userId/tags',
} as const;

export type AdminUsersRoutePath =
  (typeof ADMIN_USERS_ROUTE_PATHS)[keyof typeof ADMIN_USERS_ROUTE_PATHS];
