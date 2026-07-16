import { Navigate, type RouteObject } from 'react-router-dom';
import { AdminLayout } from '../../modules/admin/shared';
import { AdminDashboardPage } from '../../modules/admin/dashboard';
import { AdminUserDetailPage, AdminUsersPage } from '../../modules/admin/users';
import {
  AdminPublishedTrackersPage,
  AdminTrackerDetailPage,
  AdminTrackerReportsPage,
  AdminTrackersPage,
} from '../../modules/admin/trackers';
import {
  AdminMockTestDetailPage,
  AdminMockTestReportsPage,
  AdminMockTestsPage,
} from '../../modules/admin/mock-tests';
import { AdminTrackerReviewsPage } from '../../modules/admin/tracker-reviews';
import { AdminAnalyticsPage } from '../../modules/admin/analytics';
import { AdminBroadcastPage } from '../../modules/admin/broadcast';
import { AdminAuditLogsPage } from '../../modules/admin/audit-logs';
import { AdminSystemHealthPage } from '../../modules/admin/system-health';
import { AdminSupportTicketsPage } from '../../modules/admin/support-tickets';
import { AdminSettingsPage } from '../../modules/admin/settings';
import { AdminSubscriptionsPage } from '../../modules/admin/subscriptions';
import { AdminAITokenSpendPage } from '../../modules/admin/ai-token-spend';
import { ADMIN_ROUTES } from '../config/route-paths';

export const adminRoutes: RouteObject[] = [
  {
    element: <AdminLayout />,
    children: [
      { path: ADMIN_ROUTES.dashboard, element: <AdminDashboardPage /> },
      { path: ADMIN_ROUTES.users, element: <AdminUsersPage /> },
      { path: ADMIN_ROUTES.userDetailPattern, element: <AdminUserDetailPage /> },
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
      { path: ADMIN_ROUTES.activity, element: <AdminAnalyticsPage /> },
      {
        path: ADMIN_ROUTES.legacyAnalytics,
        element: <Navigate to={ADMIN_ROUTES.activity} replace />,
      },
      { path: ADMIN_ROUTES.broadcast, element: <AdminBroadcastPage /> },
      { path: ADMIN_ROUTES.subscriptions, element: <AdminSubscriptionsPage /> },
      { path: ADMIN_ROUTES.auditLogs, element: <AdminAuditLogsPage /> },
      { path: ADMIN_ROUTES.systemHealth, element: <AdminSystemHealthPage /> },
      { path: ADMIN_ROUTES.aiTokenSpend, element: <AdminAITokenSpendPage /> },
      { path: ADMIN_ROUTES.supportTickets, element: <AdminSupportTicketsPage /> },
      { path: ADMIN_ROUTES.settings, element: <AdminSettingsPage /> },
      { path: ADMIN_ROUTES.legacySupport, element: <AdminSupportTicketsPage /> },
    ],
  },
];
