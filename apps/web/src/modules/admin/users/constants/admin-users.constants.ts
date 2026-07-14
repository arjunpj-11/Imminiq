import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_USERS_ENDPOINTS = {
  list: '/admin/users',
  detail: (userId: string) => `/admin/users/${userId}`,
  status: (userId: string) => `/admin/users/${userId}/status`,
} as const;

export const ADMIN_USERS_ROUTES = {
  list: ADMIN_ROUTES.users,
  detail: ADMIN_ROUTES.userDetail,
} as const;

export const ADMIN_USER_FILTERS = ['all', 'active', 'blocked'] as const;
export const ADMIN_USERS_SEARCH_DEBOUNCE_MS = 300;
export const ADMIN_USERS_STALE_TIME_MS = 20_000;
