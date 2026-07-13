export const ONBOARDING_ROUTE_PATHS = {
  STEP_1: '/step-1',
  STEP_2: '/step-2',

  GENERATE_ROADMAP: '/generate-roadmap',

  JOB_STATUS: '/jobs/:jobId/status',
  JOB_RESULT: '/jobs/:jobId/result',
  EVALUATE_ROADMAP: '/jobs/:jobId/evaluate',
  EVALUATION_RESULT: '/jobs/:jobId/evaluation-result',
} as const

export type OnboardingRoutePath =
  (typeof ONBOARDING_ROUTE_PATHS)[keyof typeof ONBOARDING_ROUTE_PATHS]
