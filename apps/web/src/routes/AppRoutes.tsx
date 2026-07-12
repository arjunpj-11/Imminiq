import { Suspense } from 'react'
import { useRoutes, type RouteObject } from 'react-router-dom'

import AuthenticatedAppLayout from '../components/layout/AuthenticatedAppLayout'
import PageLoadingScreen from '../components/ui/PageLoadingScreen'
import NotFoundPage from '../pages/NotFoundPage'
import { AdminRoute } from './guards/AdminRoute'
import { ProtectedRoute } from './guards/ProtectedRoute'
import { adminRoutes } from './groups/admin.routes'
import { authenticatedRoutes } from './groups/authenticated.routes'
import { focusedRoutes } from './groups/focused.routes'
import { onboardingRoutes } from './groups/onboarding.routes'
import { publicRoutes } from './groups/public.routes'

const routes: RouteObject[] = [
  ...publicRoutes,
  {
    element: <ProtectedRoute />,
    children: [
      ...onboardingRoutes,
      ...focusedRoutes,
      {
        element: <AuthenticatedAppLayout />,
        children: authenticatedRoutes,
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: adminRoutes,
  },
  { path: '*', element: <NotFoundPage /> },
]

const loadingFallback = (
  <PageLoadingScreen
    eyebrow="Loading"
    title="Opening Imminiq"
    description="Preparing your page."
  />
)

export default function AppRoutes() {
  return <Suspense fallback={loadingFallback}>{useRoutes(routes)}</Suspense>
}
