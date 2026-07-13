import type { RouteObject } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminComingSoonPage from '../../components/admin/AdminComingSoonPage'
import { AdminDashboardPage } from '../../modules/admin/dashboard'
import { AdminUserDetailPage, AdminUsersPage } from '../../modules/admin/users'
import { AdminTrackerDetailPage, AdminTrackersPage } from '../../modules/admin/trackers'
import { AdminMockTestDetailPage, AdminMockTestsPage } from '../../modules/admin/mock-tests'
import { AdminTrackerReviewsPage } from '../../modules/admin/tracker-reviews'
import { AdminAnalyticsPage } from '../../modules/admin/analytics'
import { AdminBroadcastPage } from '../../modules/admin/broadcast'
import { AdminAuditLogsPage } from '../../modules/admin/audit-logs'
import { AdminSystemHealthPage } from '../../modules/admin/system-health'
import { AdminSupportTicketsPage } from '../../modules/admin/support-tickets'
import { AdminSettingsPage } from '../../modules/admin/settings'

export const adminRoutes: RouteObject[] = [
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin', element: <AdminDashboardPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/users/:userId', element: <AdminUserDetailPage /> },
      { path: '/admin/trackers', element: <AdminTrackersPage /> },
      { path: '/admin/trackers/:trackerId', element: <AdminTrackerDetailPage /> },
      { path: '/admin/mock-tests', element: <AdminMockTestsPage /> },
      { path: '/admin/mock-tests/:testId', element: <AdminMockTestDetailPage /> },
      { path: '/admin/tracker-reviews', element: <AdminTrackerReviewsPage /> },
      { path: '/admin/analytics', element: <AdminAnalyticsPage /> },
      { path: '/admin/broadcast', element: <AdminBroadcastPage /> },
      { path: '/admin/subscriptions', element: <AdminComingSoonPage /> },
      { path: '/admin/audit-logs', element: <AdminAuditLogsPage /> },
      { path: '/admin/system-health', element: <AdminSystemHealthPage /> },
      { path: '/admin/support-tickets', element: <AdminSupportTicketsPage /> },
      { path: '/admin/settings', element: <AdminSettingsPage /> },
      { path: '/admin/support', element: <AdminSupportTicketsPage /> },
    ],
  },
]
