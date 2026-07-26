import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_USERS_ENDPOINTS = {
  list: '/admin/users',
  exportCsv: '/admin/users/export.csv',
  detail: (userId: string) => `/admin/users/${userId}`,
  status: (userId: string) => `/admin/users/${userId}/status`,
  message: (userId: string) => `/admin/users/${userId}/message`,
  appeals: '/admin/users/appeals',
  appeal: (appealId: string) => `/admin/users/appeals/${appealId}`,
  privacyRequests: '/admin/users/privacy-requests',
  privacyRequest: (requestId: string) => `/admin/users/privacy-requests/${requestId}`,
  session: (userId: string, sessionId: string) => `/admin/users/${userId}/sessions/${sessionId}`,
  role: (userId: string) => `/admin/users/${userId}/role`,
  actionPassword: (userId: string) => `/admin/users/${userId}/action-password`,
  notes: (userId: string) => `/admin/users/${userId}/notes`,
  note: (userId: string, noteId: string) => `/admin/users/${userId}/notes/${noteId}`,
  tags: (userId: string) => `/admin/users/${userId}/tags`,
} as const;

export const ADMIN_USERS_ROUTES = {
  list: ADMIN_ROUTES.users,
  detail: ADMIN_ROUTES.userDetail,
  appeals: ADMIN_ROUTES.userAppeals,
} as const;

export const ADMIN_USER_FILTERS = ['all', 'active', 'paused', 'blocked', 'deactivated'] as const;
export const ADMIN_USERS_SEARCH_DEBOUNCE_MS = 300;
export const ADMIN_USERS_STALE_TIME_MS = 20_000;
