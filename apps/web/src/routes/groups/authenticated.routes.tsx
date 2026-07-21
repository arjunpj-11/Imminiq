import { Navigate, type RouteObject } from 'react-router-dom';

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
  TrackerClanPage,
  TrackerClanBattlePage,
  VerifyAndEarnPage,
  RaiseSupportTicketPage,
  SubscriptionPlansPage,
} from '../config/authenticated-pages';
import { ROUTES } from '../config/route-paths';
import SettingsShell from '../../modules/user/settings/components/SettingsShell';

export const authenticatedRoutes: RouteObject[] = [
  {
    path: ROUTES.dashboard,
    element: <DashboardPage />,
  },
  {
    path: ROUTES.profile,
    element: <ProfilePage />,
  },
  {
    path: ROUTES.learningAgent,
    element: <AdaptiveLearningPage />,
  },

  {
    path: ROUTES.settingsRoot,
    element: <SettingsShell />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.settingsSecurity} replace />,
      },
      {
        path: 'security',
        element: <AccountSecuritySettingsPage />,
      },
      {
        path: 'notifications',
        element: <NotificationSettingsPage />,
      },
      {
        path: 'preferences',
        element: <PreferencesSettingsPage />,
      },
      {
        path: 'privacy',
        element: <PrivacySettingsPage />,
      },
    ],
  },
  {
    path: ROUTES.notifications,
    element: <NotificationsPage />,
  },
  {
    path: ROUTES.trackers,
    element: <MyTrackersPage />,
  },
  {
    path: ROUTES.publishedTrackers,
    element: <MyPublishedTrackersPage />,
  },
  {
    path: ROUTES.trackerManagePattern,
    element: <TrackerManagePage />,
  },
  {
    path: ROUTES.trackerRoadmapPattern,
    element: <TrackerRoadmapPage />,
  },
  {
    path: ROUTES.trackerClanPattern,
    element: <TrackerClanPage />,
  },
  {
    path: ROUTES.trackerClanBattlePattern,
    element: <TrackerClanBattlePage />,
  },

  {
    path: ROUTES.community,
    element: <CommunityBrowsePage />,
  },
  {
    path: ROUTES.communityTrackerPattern,
    element: <CommunityPublicTrackerPage />,
  },
  {
    path: ROUTES.communityVerificationPattern,
    element: <CommunityVerifySubmissionPage />,
  },
  {
    path: ROUTES.verifyAndEarn,
    element: <VerifyAndEarnPage />,
  },

  {
    path: ROUTES.leaderboard,
    element: <LeaderboardPage />,
  },
  {
    path: ROUTES.leaderboardRewards,
    element: <LeaderboardRewardsPage />,
  },

  {
    path: ROUTES.activity,
    element: <ActivityPage />,
  },
  {
    path: ROUTES.pricing,
    element: <SubscriptionPlansPage />,
  },
  {
    path: ROUTES.support,
    element: <RaiseSupportTicketPage />,
  },

  {
    path: ROUTES.friends,
    element: <FriendsPage />,
  },
  {
    path: ROUTES.friendsSearch,
    element: <FriendsSearchPage />,
  },

  {
    path: ROUTES.mockTests,
    element: <MockTestsPage />,
  },
  {
    path: ROUTES.mockTestGeneratingPattern,
    element: <MockTestGeneratingPage />,
  },
  {
    path: ROUTES.mockTestResultPattern,
    element: <MockTestResultPage />,
  },
  {
    path: ROUTES.mockTestAnalysisPattern,
    element: <MockTestAnalysisPage />,
  },
  {
    path: ROUTES.mockTestDetailPattern,
    element: <MockTestDetailsPage />,
  },
];
