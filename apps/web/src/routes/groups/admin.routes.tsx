/* eslint-disable react-refresh/only-export-components -- Route-level lazy components intentionally live with their route map. */
import { Navigate, type RouteObject } from 'react-router-dom';
import { lazy, type ReactNode } from 'react';
import { ADMIN_ROUTES } from '../config/route-paths';
import { AdminRoleGate } from '../guards/AdminRoleGate';

const AdminLayout = lazy(() => import('../../components/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('../../modules/admin/dashboard/pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../../modules/admin/users/pages/AdminUsersPage'));
const AdminUserAppealsPage = lazy(() => import('../../modules/admin/users/pages/AdminUserAppealsPage'));
const AdminUserDetailPage = lazy(() => import('../../modules/admin/users/pages/AdminUserDetailPage'));
const AdminTrackersPage = lazy(() => import('../../modules/admin/trackers/pages/AdminTrackersPage'));
const AdminTrackerReportsPage = lazy(() => import('../../modules/admin/trackers/pages/AdminTrackerReportsPage'));
const AdminTrackerReviewsPage = lazy(() => import('../../modules/admin/trackers/pages/AdminTrackerReviewsPage'));
const AdminPublishedTrackersPage = lazy(() => import('../../modules/admin/trackers/pages/AdminPublishedTrackersPage'));
const AdminTrackerDetailPage = lazy(() => import('../../modules/admin/trackers/pages/AdminTrackerDetailPage'));
const AdminMockTestsPage = lazy(() => import('../../modules/admin/mock-tests/pages/AdminMockTestsPage'));
const AdminMockTestReportsPage = lazy(() => import('../../modules/admin/mock-tests/pages/AdminMockTestReportsPage'));
const AdminMockTestDetailPage = lazy(() => import('../../modules/admin/mock-tests/pages/AdminMockTestDetailPage'));
const AdminAnalyticsPage = lazy(() => import('../../modules/admin/analytics/pages/AdminAnalyticsPage'));
const AdminBroadcastPage = lazy(() => import('../../modules/admin/broadcast/pages/AdminBroadcastPage'));
const AdminAuditLogsPage = lazy(() => import('../../modules/admin/audit-logs/pages/AdminAuditLogsPage'));
const AdminSystemHealthPage = lazy(() => import('../../modules/admin/system-health/pages/AdminSystemHealthPage'));
const AdminSupportTicketsPage = lazy(() => import('../../modules/admin/support-tickets/pages/AdminSupportTicketsPage'));
const AdminSettingsPage = lazy(() => import('../../modules/admin/settings/pages/AdminSettingsPage'));
const AdminSubscriptionsPage = lazy(() => import('../../modules/admin/subscriptions/pages/AdminSubscriptionsPage'));
const AdminAITokenSpendPage = lazy(() => import('../../modules/admin/ai-token-spend/pages/AdminAITokenSpendPage'));

const staffOnly = (page: ReactNode) => (
  <AdminRoleGate roles={['admin', 'superadmin']}>{page}</AdminRoleGate>
);

export const adminRoutes: RouteObject[] = [
  {
    element: <AdminLayout />,
    children: [
      { path: ADMIN_ROUTES.dashboard, element: <AdminDashboardPage /> },
      { path: ADMIN_ROUTES.users, element: staffOnly(<AdminUsersPage />) },
      { path: ADMIN_ROUTES.userAppeals, element: staffOnly(<AdminUserAppealsPage />) },
      { path: ADMIN_ROUTES.userDetailPattern, element: staffOnly(<AdminUserDetailPage />) },
      { path: ADMIN_ROUTES.trackers, element: <AdminTrackersPage /> },
      { path: ADMIN_ROUTES.trackerReports, element: <AdminTrackerReportsPage /> },
      { path: ADMIN_ROUTES.trackerReviews, element: <AdminTrackerReviewsPage /> },
      { path: ADMIN_ROUTES.publishedTrackers, element: <AdminPublishedTrackersPage /> },
      { path: ADMIN_ROUTES.trackerDetailPattern, element: <AdminTrackerDetailPage /> },
      { path: ADMIN_ROUTES.mockTests, element: <AdminMockTestsPage /> },
      { path: ADMIN_ROUTES.mockTestReports, element: <AdminMockTestReportsPage /> },
      { path: ADMIN_ROUTES.mockTestDetailPattern, element: <AdminMockTestDetailPage /> },
      {
        path: ADMIN_ROUTES.legacyTrackerReviews,
        element: <Navigate to={ADMIN_ROUTES.trackerReviews} replace />,
      },
      { path: ADMIN_ROUTES.activity, element: staffOnly(<AdminAnalyticsPage />) },
      {
        path: ADMIN_ROUTES.legacyAnalytics,
        element: <Navigate to={ADMIN_ROUTES.activity} replace />,
      },
      { path: ADMIN_ROUTES.broadcast, element: staffOnly(<AdminBroadcastPage />) },
      { path: ADMIN_ROUTES.subscriptions, element: staffOnly(<AdminSubscriptionsPage />) },
      { path: ADMIN_ROUTES.auditLogs, element: staffOnly(<AdminAuditLogsPage />) },
      { path: ADMIN_ROUTES.systemHealth, element: staffOnly(<AdminSystemHealthPage />) },
      { path: ADMIN_ROUTES.aiTokenSpend, element: staffOnly(<AdminAITokenSpendPage />) },
      { path: ADMIN_ROUTES.supportTickets, element: <AdminSupportTicketsPage /> },
      { path: ADMIN_ROUTES.settings, element: staffOnly(<AdminSettingsPage />) },
      { path: ADMIN_ROUTES.legacySupport, element: <AdminSupportTicketsPage /> },
    ],
  },
];
