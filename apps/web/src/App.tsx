// apps/web/src/App.tsx

import { lazy, Suspense, useLayoutEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AdminRoute } from './routes/AdminRoute'
import { ProtectedRoute } from './routes/ProtectedRoute'

import { useAuthSync } from './hooks/auth/useAuthSync'
import { useRestoreSession } from './hooks/auth/useRestoreSession'
import { useThemeStore } from './store/useThemeStore'

// ─── SYSTEM COMPONENTS ──────────────────────────────
import NetworkRedirector from './components/system/NetworkRedirector'
import PageLoadingScreen from './components/ui/PageLoadingScreen'

// ─── AUTH PAGES ─────────────────────────────────────
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage'
import LoginPage from './modules/auth/pages/LoginPage'
import RegisterPage from './modules/auth/pages/RegisterPage'
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage'
import TwoFactorChallengePage from './modules/auth/pages/TwoFactorChallengePage'
import VerifyAccountPage from './modules/auth/pages/VerifyAccountPage'
import VerifyEmailChangePage from './modules/auth/pages/VerifyEmailChangePage'

// ─── SPECIAL SYSTEM PAGES ───────────────────────────
import BlockedPage from './pages/BlockedPage'
import NoConnectionPage from './pages/NoConnectionPage'
import NotFoundPage from './pages/NotFoundPage'
import TrackerManagePage from './modules/trackers/pages/TrackerManagePage'
import TrackerQuickRevisionPage from './modules/trackers/pages/TrackerQuickRevisionPage'
import MyPublishedTrackersPage from './modules/trackers/pages/MyPublishedTrackersPage' 
// import MyCommunityPage from './modules/community/pages/MyCommunity'
// import LeaderboardPage from './modules/leaderBoard/pages/leaderBoard'
import MockTestAnalysisPage from './modules/mock-tests/pages/MockTestAnalysisPage'
import MockTestResultPage from './modules/mock-tests/pages/MockTestResultPage'
import MockTestAttemptPage from './modules/mock-tests/pages/MockTestAttemptPage'
import MockTestDetailsPage from './modules/mock-tests/pages/MockTestDetailsPage'
import MockTestsPage from './modules/mock-tests/pages/MockTestsPage'
import MockTestCreatePage from './modules/mock-tests/pages/MockTestCreatePage'

// ─── LAZY LEGAL PAGES ───────────────────────────────
const PrivacyPage = lazy(() => import('./modules/legal/pages/PrivacyPage'))
const TermsPage = lazy(() => import('./modules/legal/pages/TermsPage'))

const LandingPage = lazy(() => import('./modules/landing/pages/LandingPage'))

// ─── LAZY ONBOARDING PAGES ──────────────────────────
const OnboardingGeneratingPage = lazy(
  () => import('./modules/onboarding/pages/OnboardingGeneratingPage')
)

const OnboardingRoadmapEvaluationLoadingPage = lazy(
  () =>
    import(
      './modules/onboarding/pages/OnboardingRoadmapEvaluationLoadingPage'
    )
)

const OnboardingRoadmapEvaluationScorePage = lazy(
  () =>
    import('./modules/onboarding/pages/OnboardingRoadmapEvaluationScorePage')
)

const OnboardingRoadmapReadyPage = lazy(
  () => import('./modules/onboarding/pages/OnboardingRoadmapReadyPage')
)

const OnboardingStepOnePage = lazy(
  () => import('./modules/onboarding/pages/OnboardingStepOnePage')
)

const OnboardingStepTwoPage = lazy(
  () => import('./modules/onboarding/pages/OnboardingStepTwoPage')
)

// ─── LAZY MAIN APP PAGES ────────────────────────────
const DashboardPage = lazy(
  () => import('./modules/dashboard/pages/DashboardPage')
)

const ProfilePage = lazy(() => import('./modules/users/pages/ProfilePage'))

// ─── LAZY SETTINGS PAGES ────────────────────────────
const AccountSecuritySettingsPage = lazy(
  () => import('./modules/settings/pages/AccountSecuritySettingsPage')
)

const NotificationSettingsPage = lazy(
  () => import('./modules/settings/pages/NotificationSettingsPage')
)

const PreferencesSettingsPage = lazy(
  () => import('./modules/settings/pages/PreferencesSettingsPage')
)

const PrivacySettingsPage = lazy(
  () => import('./modules/settings/pages/PrivacySettingsPage')
)

// ─── LAZY TRACKER PAGES ─────────────────────────────
const MyTrackersPage = lazy(
  () => import('./modules/trackers/pages/MyTrackersPage')
)

const TrackerLessonPage = lazy(
  () => import('./modules/trackers/pages/TrackerLessonPage')
)

const TrackerRoadmapPage = lazy(
  () => import('./modules/trackers/pages/TrackerRoadmapPage')
)

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme)

  useLayoutEffect(() => {
    initTheme()
  }, [initTheme])

  useRestoreSession()
  useAuthSync()

  return (
    <>
      <NetworkRedirector />

      <Suspense
        fallback={
          <PageLoadingScreen
            eyebrow="Loading"
            title="Opening Imminiq"
            description="Preparing your page."
          />
        }
      >
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

          <Route path="/" element={<LandingPage />} />

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

          <Route
  path="/trackers/:trackerId/manage"
  element={<TrackerManagePage />}
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

          {/* ─── PROTECTED TRACKER ROUTES ───────────────── */}
          <Route
            path="/trackers"
            element={
              <ProtectedRoute>
                <MyTrackersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trackers/:trackerId/roadmap"
            element={
              <ProtectedRoute>
                <TrackerRoadmapPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trackers/:trackerId/lessons/:subtopicId"
            element={
              <ProtectedRoute>
                <TrackerLessonPage />
              </ProtectedRoute>
            }
          />

          <Route path="/trackers/:trackerId/revision" element={<TrackerQuickRevisionPage />} />
          <Route path="/trackers/published" element={<MyPublishedTrackersPage />} />
            {/* <Route path="/community" element={<MyCommunityPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} /> */}
            <Route path="/mock-tests" element={<MockTestsPage />} />
<Route path="/mock-tests/create" element={<MockTestCreatePage />} />
<Route path="/mock-tests/:testId" element={<MockTestDetailsPage />} />
<Route path="/mock-tests/attempts/:attemptId" element={<MockTestAttemptPage />} />
<Route path="/mock-tests/attempts/:attemptId/result" element={<MockTestResultPage />} />
<Route path="/mock-tests/attempts/:attemptId/analysis" element={<MockTestAnalysisPage />} />
```
            

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
      </Suspense>
    </>
  )
}