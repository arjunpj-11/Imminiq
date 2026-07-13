export const MOCK_TEST_ROUTE_PATHS = {
  ROOT: '/',

  GENERATE: '/generate',
  ACTIVE_GENERATION: '/generation/active',
  IMPORT_SHARED: '/shared/:shareToken/import',

  RUN_CODE: '/attempts/:attemptId/questions/:questionId/run-code',
  SUBMIT_CODE: '/attempts/:attemptId/questions/:questionId/submit-code',

  HISTORY: '/history',

  ANALYTICS_TRENDS: '/analytics/trends',
  ANALYTICS_AI_INSIGHTS: '/analytics/ai-insights',
  ANALYTICS_TOPIC_BREAKDOWN: '/analytics/topic-breakdown',

  ATTEMPT_QUESTIONS: '/attempts/:attemptId/questions',
  ATTEMPT_ANSWERS: '/attempts/:attemptId/answers',
  ATTEMPT_FLAG: '/attempts/:attemptId/flag',
  ATTEMPT_FINISH: '/attempts/:attemptId/finish',
  ATTEMPT_RESULT: '/attempts/:attemptId/result',
  ATTEMPT_ANALYSIS: '/attempts/:attemptId/analysis',
  ATTEMPT_RETAKE: '/attempts/:attemptId/retake',

  SHARE_TEST: '/:testId/share',
  TEST_BY_ID: '/:testId',
  START_ATTEMPT: '/:testId/start',
} as const;

export type MockTestRoutePath = (typeof MOCK_TEST_ROUTE_PATHS)[keyof typeof MOCK_TEST_ROUTE_PATHS];
