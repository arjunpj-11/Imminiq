/* eslint-disable react-refresh/only-export-components -- Route-level lazy components intentionally live with their route map. */
import { Navigate, type RouteObject } from 'react-router';
import { lazy, type ReactNode } from 'react';
import { ADMIN_ROUTES } from '../config/route-paths';
import { AdminRoleGate } from '../guards/AdminRoleGate';
import AdminLayout from '../../components/admin/AdminLayout';
import { ADMIN_ROUTE_ROLES } from '../config/admin-access';
import type { AuthRole } from '../../lib/auth-roles';

const AdminDashboardPage = lazy(
  () => import('../../modules/admin/dashboard/pages/AdminDashboardPage')
);
const AdminUsersPage = lazy(() => import('../../modules/admin/users/pages/AdminUsersPage'));
const AdminUserAppealsPage = lazy(
  () => import('../../modules/admin/users/pages/AdminUserAppealsPage')
);
const AdminUserDetailPage = lazy(
  () => import('../../modules/admin/users/pages/AdminUserDetailPage')
);
const AdminTrackersPage = lazy(
  () => import('../../modules/admin/trackers/pages/AdminTrackersPage')
);
const AdminTrackerReportsPage = lazy(
  () => import('../../modules/admin/trackers/pages/AdminTrackerReportsPage')
);
const AdminTrackerReviewsPage = lazy(
  () => import('../../modules/admin/trackers/pages/AdminTrackerReviewsPage')
);
const AdminPublishedTrackersPage = lazy(
  () => import('../../modules/admin/trackers/pages/AdminPublishedTrackersPage')
);
const AdminTrackerDetailPage = lazy(
  () => import('../../modules/admin/trackers/pages/AdminTrackerDetailPage')
);
const AdminMockTestsPage = lazy(
  () => import('../../modules/admin/mock-tests/pages/AdminMockTestsPage')
);
const AdminMockTestReportsPage = lazy(
  () => import('../../modules/admin/mock-tests/pages/AdminMockTestReportsPage')
);
const AdminQuestionBankPage = lazy(
  () => import('../../modules/admin/mock-tests/pages/AdminQuestionBankPage')
);
const AdminMockTestDetailPage = lazy(
  () => import('../../modules/admin/mock-tests/pages/AdminMockTestDetailPage')
);
const AdminAnalyticsPage = lazy(
  () => import('../../modules/admin/analytics/pages/AdminAnalyticsPage')
);
const AdminBroadcastPage = lazy(
  () => import('../../modules/admin/broadcast/pages/AdminBroadcastPage')
);
const AdminAuditLogsPage = lazy(
  () => import('../../modules/admin/audit-logs/pages/AdminAuditLogsPage')
);
const AdminSystemHealthPage = lazy(
  () => import('../../modules/admin/system-health/pages/AdminSystemHealthPage')
);
const AdminSupportTicketsPage = lazy(
  () => import('../../modules/admin/support-tickets/pages/AdminSupportTicketsPage')
);
const AdminSettingsPage = lazy(
  () => import('../../modules/admin/settings/pages/AdminSettingsPage')
);
const AdminSubscriptionsPage = lazy(
  () => import('../../modules/admin/subscriptions/pages/AdminSubscriptionsPage')
);
const AdminAITokenSpendPage = lazy(
  () => import('../../modules/admin/ai-token-spend/pages/AdminAITokenSpendPage')
);

const roleGuard = (page: ReactNode, roles: readonly AuthRole[]) => (
  <AdminRoleGate roles={roles}>{page}</AdminRoleGate>
);

export const adminRoutes: RouteObject[] = [
  {
    element: <AdminLayout />,
    children: [
      {
        path: ADMIN_ROUTES.dashboard,
        element: roleGuard(<AdminDashboardPage />, ADMIN_ROUTE_ROLES.dashboard),
      },
      { path: ADMIN_ROUTES.users, element: roleGuard(<AdminUsersPage />, ADMIN_ROUTE_ROLES.users) },
      {
        path: ADMIN_ROUTES.userAppeals,
        element: roleGuard(<AdminUserAppealsPage />, ADMIN_ROUTE_ROLES.users),
      },
      {
        path: ADMIN_ROUTES.userDetailPattern,
        element: roleGuard(<AdminUserDetailPage />, ADMIN_ROUTE_ROLES.users),
      },
      {
        path: ADMIN_ROUTES.trackers,
        element: roleGuard(<AdminTrackersPage />, ADMIN_ROUTE_ROLES.trackers),
      },
      {
        path: ADMIN_ROUTES.trackerReports,
        element: roleGuard(<AdminTrackerReportsPage />, ADMIN_ROUTE_ROLES.trackers),
      },
      {
        path: ADMIN_ROUTES.trackerReviews,
        element: roleGuard(<AdminTrackerReviewsPage />, ADMIN_ROUTE_ROLES.trackers),
      },
      {
        path: ADMIN_ROUTES.publishedTrackers,
        element: roleGuard(<AdminPublishedTrackersPage />, ADMIN_ROUTE_ROLES.trackers),
      },
      {
        path: ADMIN_ROUTES.trackerDetailPattern,
        element: roleGuard(<AdminTrackerDetailPage />, ADMIN_ROUTE_ROLES.trackers),
      },
      {
        path: ADMIN_ROUTES.mockTests,
        element: roleGuard(<AdminMockTestsPage />, ADMIN_ROUTE_ROLES.mockTests),
      },
      {
        path: ADMIN_ROUTES.mockTestReports,
        element: roleGuard(<AdminMockTestReportsPage />, ADMIN_ROUTE_ROLES.mockTests),
      },
      {
        path: ADMIN_ROUTES.questionBank,
        element: roleGuard(<AdminQuestionBankPage />, ADMIN_ROUTE_ROLES.mockTests),
      },
      {
        path: ADMIN_ROUTES.mockTestDetailPattern,
        element: roleGuard(<AdminMockTestDetailPage />, ADMIN_ROUTE_ROLES.mockTests),
      },
      {
        path: ADMIN_ROUTES.legacyTrackerReviews,
        element: <Navigate to={ADMIN_ROUTES.trackerReviews} replace />,
      },
      {
        path: ADMIN_ROUTES.activity,
        element: roleGuard(<AdminAnalyticsPage />, ADMIN_ROUTE_ROLES.analytics),
      },
      {
        path: ADMIN_ROUTES.legacyAnalytics,
        element: <Navigate to={ADMIN_ROUTES.activity} replace />,
      },
      {
        path: ADMIN_ROUTES.broadcast,
        element: roleGuard(<AdminBroadcastPage />, ADMIN_ROUTE_ROLES.broadcast),
      },
      {
        path: ADMIN_ROUTES.subscriptions,
        element: roleGuard(<AdminSubscriptionsPage />, ADMIN_ROUTE_ROLES.subscriptions),
      },
      {
        path: ADMIN_ROUTES.auditLogs,
        element: roleGuard(<AdminAuditLogsPage />, ADMIN_ROUTE_ROLES.auditLogs),
      },
      {
        path: ADMIN_ROUTES.systemHealth,
        element: roleGuard(<AdminSystemHealthPage />, ADMIN_ROUTE_ROLES.systemHealth),
      },
      {
        path: ADMIN_ROUTES.aiTokenSpend,
        element: roleGuard(<AdminAITokenSpendPage />, ADMIN_ROUTE_ROLES.aiTokenSpend),
      },
      {
        path: ADMIN_ROUTES.supportTickets,
        element: roleGuard(<AdminSupportTicketsPage />, ADMIN_ROUTE_ROLES.supportTickets),
      },
      {
        path: ADMIN_ROUTES.settings,
        element: roleGuard(<AdminSettingsPage />, ADMIN_ROUTE_ROLES.settings),
      },
      {
        path: ADMIN_ROUTES.legacySupport,
        element: roleGuard(<AdminSupportTicketsPage />, ADMIN_ROUTE_ROLES.supportTickets),
      },
    ],
  },
];
