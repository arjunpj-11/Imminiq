import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_USERS_ENDPOINTS = {
  list: '/admin/users',
  detail: (userId: string) => `/admin/users/${userId}`,
  status: (userId: string) => `/admin/users/${userId}/status`,
  message: (userId: string) => `/admin/users/${userId}/message`,
  appeals: '/admin/users/appeals',
  appeal: (appealId: string) => `/admin/users/appeals/${appealId}`,
  session: (userId: string, sessionId: string) =>
    `/admin/users/${userId}/sessions/${sessionId}`,
  role: (userId: string) => `/admin/users/${userId}/role`,
} as const;

export const ADMIN_USERS_ROUTES = {
  list: ADMIN_ROUTES.users,
  detail: ADMIN_ROUTES.userDetail,
  appeals: ADMIN_ROUTES.userAppeals,
} as const;

export const ADMIN_USER_FILTERS = [
  'all',
  'active',
  'paused',
  'blocked',
  'deactivated',
  'banned',
  'unverified',
] as const;
export const ADMIN_USERS_SEARCH_DEBOUNCE_MS = 300;
export const ADMIN_USERS_STALE_TIME_MS = 20_000;
