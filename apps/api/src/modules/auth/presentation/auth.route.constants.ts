export const AUTH_ROUTE_PATHS = {
  REGISTER: '/register',
  LOGIN: '/login',
  TWO_FACTOR_VERIFY_LOGIN: '/2fa/verify-login',

  LOGOUT: '/logout',
  REFRESH_TOKEN: '/refresh-token',

  VERIFY_ACCOUNT: '/verify-account',
  SEND_OTP: '/send-otp',

  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_RESET_CODE: '/verify-reset-code',
  RESET_PASSWORD: '/reset-password',

  CHECK_IDENTIFIER: '/check-identifier',
  CHECK_USERNAME: '/check-username',

  ME: '/me',
  CHANGE_PASSWORD: '/change-password',

  SESSIONS: '/sessions',
  SESSION_BY_ID: '/sessions/:sessionId',

  OAUTH_GOOGLE: '/oauth/google',
  OAUTH_GOOGLE_CALLBACK: '/oauth/google/callback',

  OAUTH_GITHUB: '/oauth/github',
  OAUTH_GITHUB_CALLBACK: '/oauth/github/callback',
} as const

export type AuthRoutePath =
  (typeof AUTH_ROUTE_PATHS)[keyof typeof AUTH_ROUTE_PATHS]