import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_MOCK_TESTS_ENDPOINTS = {
  list: '/admin/mock-tests',
  detail: (testId: string) => `/admin/mock-tests/${testId}`,
} as const;

export const ADMIN_MOCK_TESTS_ROUTES = {
  list: ADMIN_ROUTES.mockTests,
  detail: ADMIN_ROUTES.mockTestDetail,
} as const;

export const ADMIN_MOCK_TESTS_STALE_TIME_MS = 30_000;
