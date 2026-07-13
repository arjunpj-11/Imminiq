import type { RouteObject } from 'react-router-dom'

import {
  AdaptiveLearningPage,
  AccountSecuritySettingsPage,
  ActivityPage,
  CommunityBrowsePage,
  CommunityPublicTrackerPage,
  CommunityVerifySubmissionPage,
  DashboardPage,
  FriendsPage,
  FriendsSearchPage,
  LeaderboardPage,
  LeaderboardRewardsPage,
  MockTestAnalysisPage,
  MockTestDetailsPage,
  MockTestGeneratingPage,
  MockTestResultPage,
  MockTestsPage,
  MyPublishedTrackersPage,
  MyTrackersPage,
  NotificationSettingsPage,
  NotificationsPage,
  PreferencesSettingsPage,
  PrivacySettingsPage,
  ProfilePage,
  TrackerManagePage,
  TrackerRoadmapPage,
  VerifyAndEarnPage,
} from '../config/authenticated-pages'

export const authenticatedRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/learning-agent',
    element: <AdaptiveLearningPage />,
  },

  {
    path: '/settings/security',
    element: <AccountSecuritySettingsPage />,
  },
  {
    path: '/settings/notifications',
    element: <NotificationSettingsPage />,
  },
  {
    path: '/notifications',
    element: <NotificationsPage />,
  },
  {
    path: '/settings/preferences',
    element: <PreferencesSettingsPage />,
  },
  {
    path: '/settings/privacy',
    element: <PrivacySettingsPage />,
  },

  {
    path: '/trackers',
    element: <MyTrackersPage />,
  },
  {
    path: '/trackers/published',
    element: <MyPublishedTrackersPage />,
  },
  {
    path: '/trackers/:trackerId/manage',
    element: <TrackerManagePage />,
  },
  {
    path: '/trackers/:trackerId/roadmap',
    element: <TrackerRoadmapPage />,
  },

  {
    path: '/community',
    element: <CommunityBrowsePage />,
  },
  {
    path: '/community/trackers/:trackerId',
    element: <CommunityPublicTrackerPage />,
  },
  {
    path: '/community/verify/:submissionId',
    element: <CommunityVerifySubmissionPage />,
  },
  {
    path: '/verify-and-earn',
    element: <VerifyAndEarnPage />,
  },

  {
    path: '/leaderboard',
    element: <LeaderboardPage />,
  },
  {
    path: '/leaderboard/rewards',
    element: <LeaderboardRewardsPage />,
  },

  {
    path: '/activity',
    element: <ActivityPage />,
  },

  {
    path: '/friends',
    element: <FriendsPage />,
  },
  {
    path: '/friends/search',
    element: <FriendsSearchPage />,
  },

  {
    path: '/mock-tests',
    element: <MockTestsPage />,
  },
  {
    path: '/mock-tests/generating/:jobId',
    element: <MockTestGeneratingPage />,
  },
  {
    path: '/mock-tests/attempts/:attemptId/result',
    element: <MockTestResultPage />,
  },
  {
    path: '/mock-tests/attempts/:attemptId/analysis',
    element: <MockTestAnalysisPage />,
  },
  {
    path: '/mock-tests/:testId',
    element: <MockTestDetailsPage />,
  },
]
