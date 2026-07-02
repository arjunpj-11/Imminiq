import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const MockTestAttemptPage = lazy(
  () => import('../modules/mock-tests/pages/MockTestAttemptPage'),
)

export const focusedRoutes: RouteObject[] = [
  {
    path: '/mock-tests/attempts/:attemptId',
    element: <MockTestAttemptPage />,
  },
]
