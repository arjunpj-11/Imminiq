import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'
import RegisterPage from './modules/auth/pages/RegisterPage'
import LoginPage from './modules/auth/pages/LoginPage'
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage'
import VerifyAccountPage from './modules/auth/pages/VerifyAccountPage'
import PrivacyPage from './modules/legal/pages/PrivacyPage'
import TermsPage from './modules/legal/pages/TermsPage'
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage'
import OnboardingStepTwoPage from './modules/onboarding/pages/OnboardingStepTwoPage'
import OnboardingGeneratingPage from './modules/onboarding/pages/OnboardingGeneratingPage'
import { useEffect } from 'react'
import { useThemeStore } from './store/useThemeStore'
import OnboardingStepOnePage from './modules/onboarding/pages/OnboardingStepOnePage'
import { useRestoreSession } from './hooks/auth/useRestoreSession'
import OnboardingRoadmapReadyPage from './modules/onboarding/pages/OnboardingRoadmapReadyPage'

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useRestoreSession()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-account" element={<VerifyAccountPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* Protected onboarding route */}
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

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div>Dashboard</div>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
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