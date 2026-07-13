export const ONBOARDING_ROUTE_PATHS = {
  TRACKER_INTAKE: '/tracker-intake',
  STEP_1: '/step-1',
  STEP_2: '/step-2',

  GENERATE_ROADMAP: '/generate-roadmap',
  ACTIVE_ROADMAP_JOB: '/roadmap-jobs/active',

  JOB_STATUS: '/jobs/:jobId/status',
  JOB_RESULT: '/jobs/:jobId/result',
  EVALUATE_ROADMAP: '/jobs/:jobId/evaluate',
  EVALUATION_RESULT: '/jobs/:jobId/evaluation-result',
} as const;

export type OnboardingRoutePath =
  (typeof ONBOARDING_ROUTE_PATHS)[keyof typeof ONBOARDING_ROUTE_PATHS];
