import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'

import { useThemeStore } from './store/useThemeStore'
import { useRestoreSession } from './hooks/auth/useRestoreSession'
import { useAuthSync } from './hooks/auth/useAuthSync'

import RegisterPage from './modules/auth/pages/RegisterPage'
import LoginPage from './modules/auth/pages/LoginPage'
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage'
import VerifyAccountPage from './modules/auth/pages/VerifyAccountPage'
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage'
import VerifyEmailChangePage from './modules/auth/pages/VerifyEmailChangePage'

import PrivacyPage from './modules/legal/pages/PrivacyPage'
import TermsPage from './modules/legal/pages/TermsPage'

import OnboardingStepOnePage from './modules/onboarding/pages/OnboardingStepOnePage'
import OnboardingStepTwoPage from './modules/onboarding/pages/OnboardingStepTwoPage'
import OnboardingGeneratingPage from './modules/onboarding/pages/OnboardingGeneratingPage'
import OnboardingRoadmapReadyPage from './modules/onboarding/pages/OnboardingRoadmapReadyPage'
import OnboardingRoadmapEvaluationScorePage from './modules/onboarding/pages/OnboardingRoadmapEvaluationScorePage'
import OnboardingRoadmapEvaluationLoadingPage from './modules/onboarding/pages/OnboardingRoadmapEvaluationLoadingPage'

import ProfilePage from './modules/users/pages/ProfilePage'

import AccountSecuritySettingsPage from './modules/settings/pages/AccountSecuritySettingsPage'
import NotificationSettingsPage from './modules/settings/pages/NotificationSettingsPage'
import PreferencesSettingsPage from './modules/settings/pages/PreferencesSettingsPage'
import PrivacySettingsPage from './modules/settings/pages/PrivacySettingsPage'
import TwoFactorChallengePage from './modules/auth/pages/TwoFactorChallengePage'

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useRestoreSession()
  useAuthSync()

  return (
    <Routes>
      {/* ─── PUBLIC ROUTES ───────────────────────────── */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-account" element={<VerifyAccountPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email-change" element={<VerifyEmailChangePage />} />

      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
<Route
  path="/two-factor-challenge"
  element={<TwoFactorChallengePage />}
/>
      {/* Public profile route — guests can view this */}
      <Route path="/profile/:username" element={<ProfilePage />} />

      {/* ─── ROADMAP EVALUATION ROUTES ───────────────── */}
      <Route
        path="/onboarding/roadmap-evaluation/:jobId"
        element={<OnboardingRoadmapEvaluationLoadingPage />}
      />

      <Route
        path="/onboarding/roadmap-evaluation/:jobId/score"
        element={<OnboardingRoadmapEvaluationScorePage />}
      />

      {/* ─── PROTECTED ONBOARDING ROUTES ─────────────── */}
      <Route
        path="/onboarding/step-1"
        element={
          <ProtectedRoute>
            <OnboardingStepOnePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/step-2"
        element={
          <ProtectedRoute>
            <OnboardingStepTwoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/generating/:jobId"
        element={
          <ProtectedRoute>
            <OnboardingGeneratingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/roadmap-ready/:jobId"
        element={
          <ProtectedRoute>
            <OnboardingRoadmapReadyPage />
          </ProtectedRoute>
        }
      />

      {/* ─── PROTECTED APP ROUTES ────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div>Dashboard</div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* ─── PROTECTED SETTINGS ROUTES ──────────────── */}
      <Route
        path="/settings/security"
        element={
          <ProtectedRoute>
            <AccountSecuritySettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/notifications"
        element={
          <ProtectedRoute>
            <NotificationSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/preferences"
        element={
          <ProtectedRoute>
            <PreferencesSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/privacy"
        element={
          <ProtectedRoute>
            <PrivacySettingsPage />
          </ProtectedRoute>
        }
      />

      {/* ─── ADMIN ROUTES ────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <div>Admin</div>
          </AdminRoute>
        }
      />
    </Routes>
  )
}