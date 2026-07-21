import { ADMIN_ROUTES } from "../../../../routes/config/route-paths";

export const ADMIN_MOCK_TESTS_ENDPOINTS = {
  list: "/admin/mock-tests",
  detail: (testId: string) => `/admin/mock-tests/${testId}`,
  reports: "/admin/mock-tests/issues",
  questionBank: "/admin/mock-tests/question-bank",
  questionBankItem: (bankId: number) => `/admin/mock-tests/question-bank/${bankId}`,
  restoreQuestionBankItem: (bankId: number) =>
    `/admin/mock-tests/question-bank/${bankId}/restore`,
  report: (issueId: string) => `/admin/mock-tests/issues/${issueId}`,
  lifecycle: (testId: string) => `/admin/mock-tests/${testId}/lifecycle`,
} as const;

export const ADMIN_MOCK_TESTS_ROUTES = {
  list: ADMIN_ROUTES.mockTests,
  detail: ADMIN_ROUTES.mockTestDetail,
  reports: ADMIN_ROUTES.mockTestReports,
  questionBank: ADMIN_ROUTES.questionBank,
} as const;

export const ADMIN_MOCK_TESTS_STALE_TIME_MS = 30_000;
