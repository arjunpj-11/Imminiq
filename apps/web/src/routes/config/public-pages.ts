import { lazy } from 'react';

export { default as BlockedPage } from '../../pages/BlockedPage';
export { default as NoConnectionPage } from '../../pages/NoConnectionPage';

export const LandingPage = lazy(() => import('../../modules/landing/pages/LandingPage'));

export const PrivacyPage = lazy(() => import('../../modules/legal/pages/PrivacyPage'));

export const TermsPage = lazy(() => import('../../modules/legal/pages/TermsPage'));

export const ForgotPasswordPage = lazy(() => import('../../modules/auth/pages/ForgotPasswordPage'));

export const LoginPage = lazy(() => import('../../modules/auth/pages/LoginPage'));

export const RegisterPage = lazy(() => import('../../modules/auth/pages/RegisterPage'));

export const ResetPasswordPage = lazy(() => import('../../modules/auth/pages/ResetPasswordPage'));

export const TwoFactorChallengePage = lazy(
  () => import('../../modules/auth/pages/TwoFactorChallengePage')
);

export const VerifyAccountPage = lazy(() => import('../../modules/auth/pages/VerifyAccountPage'));

export const VerifyEmailChangePage = lazy(
  () => import('../../modules/auth/pages/VerifyEmailChangePage')
);

export const ProfilePage = lazy(() => import('../../modules/user/users/pages/ProfilePage'));
