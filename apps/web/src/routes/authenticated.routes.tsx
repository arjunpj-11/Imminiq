import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const DashboardPage = lazy(
  () => import('../modules/dashboard/pages/DashboardPage'),
)
const ProfilePage = lazy(() => import('../modules/users/pages/ProfilePage'))
const AccountSecuritySettingsPage = lazy(
  () => import('../modules/settings/pages/AccountSecuritySettingsPage'),
)
const NotificationSettingsPage = lazy(
  () => import('../modules/settings/pages/NotificationSettingsPage'),
)
const PreferencesSettingsPage = lazy(
  () => import('../modules/settings/pages/PreferencesSettingsPage'),
)
const PrivacySettingsPage = lazy(
  () => import('../modules/settings/pages/PrivacySettingsPage'),
)
const MyTrackersPage = lazy(
  () => import('../modules/trackers/pages/MyTrackersPage'),
)
const MyPublishedTrackersPage = lazy(
  () => import('../modules/trackers/pages/MyPublishedTrackersPage'),
)
const TrackerManagePage = lazy(
  () => import('../modules/trackers/pages/TrackerManagePage'),
)
const TrackerQuickRevisionPage = lazy(
  () => import('../modules/trackers/pages/TrackerQuickRevisionPage'),
)
const TrackerLessonPage = lazy(
  () => import('../modules/trackers/pages/TrackerLessonPage'),
)
const TrackerRoadmapPage = lazy(
  () => import('../modules/trackers/pages/TrackerRoadmapPage'),
)
const CommunityBrowsePage = lazy(
  () => import('../modules/community/pages/CommunityBrowsePage'),
)
const CommunityPublicTrackerPage = lazy(
  () => import('../modules/community/pages/CommunityPublicTrackerPage'),
)
const CommunityVerifySubmissionPage = lazy(
  () => import('../modules/community/pages/CommunityVerifySubmissionPage'),
)
const VerifyAndEarnPage = lazy(
  () => import('../modules/community/pages/VerifyAndEarnPage'),
)
const ActivityPage = lazy(
  () => import('../modules/activity/pages/ActivityPage'),
)
const FriendsPage = lazy(
  () => import('../modules/friends/pages/FriendsPage'),
)
const FriendsSearchPage = lazy(
  () => import('../modules/friends/pages/FriendsSearchPage'),
)
const LeaderboardPage = lazy(
  () => import('../modules/leaderboard/pages/LeaderboardPage'),
)
const LeaderboardRewardsPage = lazy(
  () => import('../modules/leaderboard/pages/LeaderboardRewardsPage'),
)
const MockTestsPage = lazy(
  () => import('../modules/mock-tests/pages/MockTestsPage'),
)
const MockTestAnalysisPage = lazy(
  () => import('../modules/mock-tests/pages/MockTestAnalysisPage'),
)
const MockTestDetailsPage = lazy(
  () => import('../modules/mock-tests/pages/MockTestDetailsPage'),
)
const MockTestResultPage = lazy(
  () => import('../modules/mock-tests/pages/MockTestResultPage'),
)

export const authenticatedRoutes: RouteObject[] = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/settings/security', element: <AccountSecuritySettingsPage /> },
  { path: '/settings/notifications', element: <NotificationSettingsPage /> },
  { path: '/settings/preferences', element: <PreferencesSettingsPage /> },
  { path: '/settings/privacy', element: <PrivacySettingsPage /> },
  { path: '/trackers', element: <MyTrackersPage /> },
  { path: '/trackers/published', element: <MyPublishedTrackersPage /> },
  { path: '/trackers/:trackerId/manage', element: <TrackerManagePage /> },
  { path: '/trackers/:trackerId/roadmap', element: <TrackerRoadmapPage /> },
  {
    path: '/trackers/:trackerId/lessons/:subtopicId',
    element: <TrackerLessonPage />,
  },
  { path: '/trackers/:trackerId/revision', element: <TrackerQuickRevisionPage /> },
  { path: '/community', element: <CommunityBrowsePage /> },
  {
    path: '/community/trackers/:trackerId',
    element: <CommunityPublicTrackerPage />,
  },
  { path: '/verify-and-earn', element: <VerifyAndEarnPage /> },
  {
    path: '/community/verify/:submissionId',
    element: <CommunityVerifySubmissionPage />,
  },
  { path: '/leaderboard', element: <LeaderboardPage /> },
  { path: '/leaderboard/rewards', element: <LeaderboardRewardsPage /> },
  { path: '/activity', element: <ActivityPage /> },
  { path: '/friends', element: <FriendsPage /> },
  { path: '/friends/search', element: <FriendsSearchPage /> },
  { path: '/mock-tests', element: <MockTestsPage /> },
  { path: '/mock-tests/:testId', element: <MockTestDetailsPage /> },
  {
    path: '/mock-tests/attempts/:attemptId/result',
    element: <MockTestResultPage />,
  },
  {
    path: '/mock-tests/attempts/:attemptId/analysis',
    element: <MockTestAnalysisPage />,
  },
]
