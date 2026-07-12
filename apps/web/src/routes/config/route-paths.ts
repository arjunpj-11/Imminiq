export const ROUTES = {
  home: '/',
  register: '/register',
  login: '/login',
  forgotPassword: '/forgot-password',
  verifyAccount: '/verify-account',
  resetPassword: '/reset-password',
  verifyEmailChange: '/verify-email-change',
  twoFactorChallenge: '/two-factor-challenge',
  blocked: '/blocked',
  offline: '/offline',
  privacy: '/privacy',
  terms: '/terms',
  dashboard: '/dashboard',
  profile: '/profile',
  publicProfile: '/profile/:username',
} as const

const PUBLIC_EXACT_PATHS = new Set<string>([
  ROUTES.home,
  ROUTES.register,
  ROUTES.login,
  ROUTES.forgotPassword,
  ROUTES.verifyAccount,
  ROUTES.resetPassword,
  ROUTES.verifyEmailChange,
  ROUTES.twoFactorChallenge,
  ROUTES.blocked,
  ROUTES.offline,
  ROUTES.privacy,
  ROUTES.terms,
])

export const isPublicRoute = (pathname: string) =>
  PUBLIC_EXACT_PATHS.has(pathname) ||
  (pathname.startsWith('/profile/') && pathname !== ROUTES.profile)
