// apps/web/src/App.tsx

import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AdminRoute } from './routes/AdminRoute'
import { ProtectedRoute } from './routes/ProtectedRoute'

import { useAuthSync } from './hooks/auth/useAuthSync'
import { useRestoreSession } from './hooks/auth/useRestoreSession'
import { useThemeStore } from './store/useThemeStore'

// ─── SYSTEM COMPONENTS ──────────────────────────────
import NetworkRedirector from './components/system/NetworkRedirector'

// ─── AUTH PAGES ─────────────────────────────────────
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage'
import LoginPage from './modules/auth/pages/LoginPage'
import RegisterPage from './modules/auth/pages/RegisterPage'
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage'
import TwoFactorChallengePage from './modules/auth/pages/TwoFactorChallengePage'
import VerifyAccountPage from './modules/auth/pages/VerifyAccountPage'
import VerifyEmailChangePage from './modules/auth/pages/VerifyEmailChangePage'


// ─── LEGAL PAGES ────────────────────────────────────
import PrivacyPage from './modules/legal/pages/PrivacyPage'
import TermsPage from './modules/legal/pages/TermsPage'

// ─── ONBOARDING PAGES ───────────────────────────────
import OnboardingGeneratingPage from './modules/onboarding/pages/OnboardingGeneratingPage'
import OnboardingRoadmapEvaluationLoadingPage from './modules/onboarding/pages/OnboardingRoadmapEvaluationLoadingPage'
import OnboardingRoadmapEvaluationScorePage from './modules/onboarding/pages/OnboardingRoadmapEvaluationScorePage'
import OnboardingRoadmapReadyPage from './modules/onboarding/pages/OnboardingRoadmapReadyPage'
import OnboardingStepOnePage from './modules/onboarding/pages/OnboardingStepOnePage'
import OnboardingStepTwoPage from './modules/onboarding/pages/OnboardingStepTwoPage'

// ─── MAIN APP PAGES ─────────────────────────────────
import DashboardPage from './modules/dashboard/pages/DashboardPage'
import ProfilePage from './modules/users/pages/ProfilePage'

// ─── SETTINGS PAGES ─────────────────────────────────
import AccountSecuritySettingsPage from './modules/settings/pages/AccountSecuritySettingsPage'
import NotificationSettingsPage from './modules/settings/pages/NotificationSettingsPage'
import PreferencesSettingsPage from './modules/settings/pages/PreferencesSettingsPage'
import PrivacySettingsPage from './modules/settings/pages/PrivacySettingsPage'


import MyTrackersPage from './modules/trackers/pages/MyTrackersPage'
import TrackerRoadmapPage from './modules/trackers/pages/TrackerRoadmapPage'
import TrackerLessonPage from './modules/trackers/pages/TrackerLessonPage'



// ─── SPECIAL SYSTEM PAGES ───────────────────────────
import BlockedPage from './pages/BlockedPage'
import NoConnectionPage from './pages/NoConnectionPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useRestoreSession()
  useAuthSync()

  return (
    <>
      <NetworkRedirector />

      <Routes>
        {/* ─── PUBLIC AUTH ROUTES ─────────────────────── */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-account" element={<VerifyAccountPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/verify-email-change"
          element={<VerifyEmailChangePage />}
        />
        <Route
          path="/two-factor-challenge"
          element={<TwoFactorChallengePage />}
        />

        {/* ─── PUBLIC SYSTEM ROUTES ───────────────────── */}
        <Route path="/blocked" element={<BlockedPage />} />
        <Route path="/offline" element={<NoConnectionPage />} />

        {/* ─── PUBLIC LEGAL ROUTES ────────────────────── */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* ─── PUBLIC PROFILE ROUTE ───────────────────── */}
        <Route path="/profile/:username" element={<ProfilePage />} />

        {/* ─── PROTECTED ONBOARDING ROUTES ────────────── */}
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

        <Route
          path="/onboarding/roadmap-evaluation/:jobId"
          element={
            <ProtectedRoute>
              <OnboardingRoadmapEvaluationLoadingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding/roadmap-evaluation/:jobId/score"
          element={
            <ProtectedRoute>
              <OnboardingRoadmapEvaluationScorePage />
            </ProtectedRoute>
          }
        />

        {/* ─── PROTECTED MAIN APP ROUTES ──────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
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

        {/* ─── PROTECTED SETTINGS ROUTES ─────────────── */}
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


<Route path="/trackers" element={<MyTrackersPage />} />
<Route path="/trackers/:trackerId/roadmap" element={<TrackerRoadmapPage />} />
<Route path="/trackers/:trackerId/lessons/:subtopicId" element={<TrackerLessonPage />} />

        {/* ─── ADMIN ROUTES ───────────────────────────── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>Admin</div>
            </AdminRoute>
          }
        />

        {/* ─── 404 FALLBACK — KEEP THIS LAST ──────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}