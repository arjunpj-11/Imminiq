export const SECURITY_ROUTE_PATHS = {
  VERIFY_EMAIL_CHANGE: '/verify-email-change',

  OVERVIEW: '/overview',

  CHANGE_EMAIL: '/change-email',
  CHANGE_PASSWORD: '/change-password',

  SESSION_BY_ID: '/sessions/:sessionId',

  TWO_FACTOR_SETUP: '/2fa/setup',
  TWO_FACTOR_VERIFY: '/2fa/verify',
  TWO_FACTOR_DISABLE: '/2fa/disable',

  DELETE_ACCOUNT: '/delete-account',
} as const;

export type SecurityRoutePath = (typeof SECURITY_ROUTE_PATHS)[keyof typeof SECURITY_ROUTE_PATHS];
