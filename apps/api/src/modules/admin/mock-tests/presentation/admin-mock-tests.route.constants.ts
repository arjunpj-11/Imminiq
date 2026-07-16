export const ADMIN_MOCK_TESTS_ROUTE_PATHS = {
  ROOT: '/',
  ISSUES: '/issues',
  ISSUE_DETAIL: '/issues/:issueId',
  LIFECYCLE: '/:id/lifecycle',
  DETAIL: '/:id',
} as const;

export type AdminMockTestsRoutePath =
  (typeof ADMIN_MOCK_TESTS_ROUTE_PATHS)[keyof typeof ADMIN_MOCK_TESTS_ROUTE_PATHS];
