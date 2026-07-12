import type { RouteObject } from 'react-router-dom'

import {
  BlockedPage,
  ForgotPasswordPage,
  LandingPage,
  LoginPage,
  NoConnectionPage,
  PrivacyPage,
  ProfilePage,
  RegisterPage,
  ResetPasswordPage,
  TermsPage,
  TwoFactorChallengePage,
  VerifyAccountPage,
  VerifyEmailChangePage,
} from '../config/public-pages'
import { ROUTES } from '../config/route-paths'

export const publicRoutes: RouteObject[] = [
  {
    path: ROUTES.home,
    element: <LandingPage />,
  },
  {
    path: ROUTES.register,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: ROUTES.forgotPassword,
    element: <ForgotPasswordPage />,
  },
  {
    path: ROUTES.verifyAccount,
    element: <VerifyAccountPage />,
  },
  {
    path: ROUTES.resetPassword,
    element: <ResetPasswordPage />,
  },
  {
    path: ROUTES.verifyEmailChange,
    element: <VerifyEmailChangePage />,
  },
  {
    path: ROUTES.twoFactorChallenge,
    element: <TwoFactorChallengePage />,
  },
  {
    path: ROUTES.blocked,
    element: <BlockedPage />,
  },
  {
    path: ROUTES.offline,
    element: <NoConnectionPage />,
  },
  {
    path: ROUTES.privacy,
    element: <PrivacyPage />,
  },
  {
    path: ROUTES.terms,
    element: <TermsPage />,
  },
  {
    path: ROUTES.publicProfile,
    element: <ProfilePage />,
  },
]