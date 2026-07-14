export const TOTAL_OTP_SECONDS = 10 * 60;
export const OTP_RESEND_WAIT_SECONDS = 45;
export const OTP_LENGTH = 6;

export const AUTH_API_PATHS = {
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyAccount: '/auth/verify-account',
  verifyResetCode: '/auth/verify-reset-code',
  sendOtp: '/auth/send-otp',
  verifyTwoFactorLogin: '/auth/2fa/verify-login',
  verifyEmailChange: '/security/verify-email-change',
  logout: '/auth/logout',
  oauthGoogle: '/auth/oauth/google',
  oauthGithub: '/auth/oauth/github',
} as const;
