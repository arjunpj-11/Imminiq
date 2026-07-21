export const ADMIN_MOCK_TESTS_ROUTE_PATHS = {
  ROOT: '/',
  EXPORT: '/export.csv',
  BULK_LIFECYCLE: '/bulk/lifecycle',
  ISSUES: '/issues',
  QUESTION_BANK: '/question-bank',
  QUESTION_BANK_ITEM: '/question-bank/:bankId',
  QUESTION_BANK_RESTORE: '/question-bank/:bankId/restore',
  ISSUE_DETAIL: '/issues/:issueId',
  APPEALS: '/appeals',
  APPEAL_DETAIL: '/appeals/:appealId',
  LIFECYCLE: '/:id/lifecycle',
  QUESTION_VERSIONS: '/questions/:questionId/versions',
  QUESTION_VERSION_RESTORE: '/questions/:questionId/versions/:version/restore',
  DETAIL: '/:id',
} as const;

export type AdminMockTestsRoutePath =
  (typeof ADMIN_MOCK_TESTS_ROUTE_PATHS)[keyof typeof ADMIN_MOCK_TESTS_ROUTE_PATHS];
