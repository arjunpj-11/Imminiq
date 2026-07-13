import type { RouteObject } from 'react-router-dom'
import AdminLayout from '../../modules/admin/AdminLayout'
import AdminComingSoonPage from '../../modules/admin/AdminComingSoonPage'
import { AdminDashboardPage } from '../../modules/admin/dashboard'
import { AdminUserDetailPage, AdminUsersPage } from '../../modules/admin/users'

const unavailableAdminPaths = [
  'trackers',
  'mock-tests',
  'reports',
  'analytics',
  'broadcast',
  'subscriptions',
  'audit-logs',
  'system-health',
  'support-tickets',
  'settings',
  'support',
]

export const adminRoutes: RouteObject[] = [
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin', element: <AdminDashboardPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/users/:userId', element: <AdminUserDetailPage /> },
      ...unavailableAdminPaths.map((path) => ({
        path: `/admin/${path}`,
        element: <AdminComingSoonPage />,
      })),
    ],
  },
]
