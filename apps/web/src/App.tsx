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
import { useEffect } from 'react'
import { useThemeStore } from './store/useThemeStore'



export default function App() {
 const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <Routes>
      {/* public routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-account" element={<VerifyAccountPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />


      {/* protected routes — replace divs with real pages as you build */}
      <Route path="/dashboard" element={
        <ProtectedRoute><div>Dashboard</div></ProtectedRoute>
      } />

      {/* admin routes */}
      <Route path="/admin" element={
        <AdminRoute><div>Admin</div></AdminRoute>
      } />
    </Routes>
  )
}