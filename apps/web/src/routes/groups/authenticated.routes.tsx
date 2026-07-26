import type { ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router';

import {
  AdaptiveLearningPage,
  AccountSecuritySettingsPage,
  ActivityPage,
  SavedItemsPage,
  CommunityBrowsePage,
  CommunityPublicTrackerPage,
  CommunityVerifySubmissionPage,
  DashboardPage,
  FriendsSearchPage,
  SocialPage,
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
import { SettingsShell } from '../../modules/user/settings';
import type { FeatureKey } from '../../config/feature-availability';
import { FeatureAvailabilityGate } from '../guards/FeatureAvailabilityGate';

const gate = (feature: FeatureKey | readonly FeatureKey[], element: ReactNode) => (
  <FeatureAvailabilityGate feature={feature}>{element}</FeatureAvailabilityGate>
);

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
    element: gate('adaptiveLearning', <AdaptiveLearningPage />),
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
    element: gate('trackers', <MyTrackersPage />),
  },
  {
    path: ROUTES.publishedTrackers,
    element: gate('trackers', <MyPublishedTrackersPage />),
  },
  {
    path: ROUTES.trackerManagePattern,
    element: gate('trackers', <TrackerManagePage />),
  },
  {
    path: ROUTES.trackerRoadmapPattern,
    element: gate('trackers', <TrackerRoadmapPage />),
  },
  {
    path: ROUTES.trackerClanPattern,
    element: gate('trackers', <TrackerClanPage />),
  },
  {
    path: ROUTES.trackerClanBattlePattern,
    element: gate('trackers', <TrackerClanBattlePage />),
  },

  {
    path: ROUTES.community,
    element: gate('community', <CommunityBrowsePage />),
  },
  {
    path: ROUTES.communityTrackerPattern,
    element: gate('community', <CommunityPublicTrackerPage />),
  },
  {
    path: ROUTES.communityVerificationPattern,
    element: gate('community', <CommunityVerifySubmissionPage />),
  },
  {
    path: ROUTES.verifyAndEarn,
    element: gate('community', <VerifyAndEarnPage />),
  },

  {
    path: ROUTES.leaderboard,
    element: gate('leaderboard', <LeaderboardPage />),
  },
  {
    path: ROUTES.leaderboardRewards,
    element: gate('leaderboard', <LeaderboardRewardsPage />),
  },

  {
    path: ROUTES.activity,
    element: gate('activity', <ActivityPage />),
  },
  {
    path: ROUTES.saved,
    element: gate('savedItems', <SavedItemsPage />),
  },
  {
    path: ROUTES.pricing,
    element: gate('subscriptions', <SubscriptionPlansPage />),
  },
  {
    path: ROUTES.support,
    element: gate('supportTickets', <RaiseSupportTicketPage />),
  },

  {
    path: ROUTES.chat,
    element: gate('social', <SocialPage />),
  },
  {
    path: ROUTES.friends,
    element: gate('social', <Navigate to={`${ROUTES.chat}?view=friends`} replace />),
  },
  {
    path: ROUTES.friendsSearch,
    element: gate('social', <FriendsSearchPage />),
  },

  {
    path: ROUTES.mockTests,
    element: gate('mockTests', <MockTestsPage />),
  },
  {
    path: ROUTES.mockTestGeneratingPattern,
    element: gate('mockTests', <MockTestGeneratingPage />),
  },
  {
    path: ROUTES.mockTestResultPattern,
    element: gate('mockTests', <MockTestResultPage />),
  },
  {
    path: ROUTES.mockTestAnalysisPattern,
    element: gate('mockTests', <MockTestAnalysisPage />),
  },
  {
    path: ROUTES.mockTestDetailPattern,
    element: gate('mockTests', <MockTestDetailsPage />),
  },
];
