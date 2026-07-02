import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

import BlockedPage from '../pages/BlockedPage'
import NoConnectionPage from '../pages/NoConnectionPage'
import { ROUTES } from './route-paths'

const LandingPage = lazy(() => import('../modules/landing/pages/LandingPage'))
const PrivacyPage = lazy(() => import('../modules/legal/pages/PrivacyPage'))
const TermsPage = lazy(() => import('../modules/legal/pages/TermsPage'))
const ForgotPasswordPage = lazy(
  () => import('../modules/auth/pages/ForgotPasswordPage'),
)
const LoginPage = lazy(() => import('../modules/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('../modules/auth/pages/RegisterPage'))
const ResetPasswordPage = lazy(
  () => import('../modules/auth/pages/ResetPasswordPage'),
)
const TwoFactorChallengePage = lazy(
  () => import('../modules/auth/pages/TwoFactorChallengePage'),
)
const VerifyAccountPage = lazy(
  () => import('../modules/auth/pages/VerifyAccountPage'),
)
const VerifyEmailChangePage = lazy(
  () => import('../modules/auth/pages/VerifyEmailChangePage'),
)
const ProfilePage = lazy(() => import('../modules/users/pages/ProfilePage'))

export const publicRoutes: RouteObject[] = [
  { path: ROUTES.home, element: <LandingPage /> },
  { path: ROUTES.register, element: <RegisterPage /> },
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
  { path: ROUTES.verifyAccount, element: <VerifyAccountPage /> },
  { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
  { path: ROUTES.verifyEmailChange, element: <VerifyEmailChangePage /> },
  { path: ROUTES.twoFactorChallenge, element: <TwoFactorChallengePage /> },
  { path: ROUTES.blocked, element: <BlockedPage /> },
  { path: ROUTES.offline, element: <NoConnectionPage /> },
  { path: ROUTES.privacy, element: <PrivacyPage /> },
  { path: ROUTES.terms, element: <TermsPage /> },
  { path: ROUTES.publicProfile, element: <ProfilePage /> },
]
