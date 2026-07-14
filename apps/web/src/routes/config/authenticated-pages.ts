import { lazy } from 'react';

export const DashboardPage = lazy(() => import('../../modules/user/dashboard/pages/DashboardPage'));

export const ProfilePage = lazy(() => import('../../modules/user/users/pages/ProfilePage'));

export const AccountSecuritySettingsPage = lazy(
  () => import('../../modules/user/settings/pages/AccountSecuritySettingsPage')
);

export const NotificationSettingsPage = lazy(
  () => import('../../modules/user/settings/pages/NotificationSettingsPage')
);

export const NotificationsPage = lazy(
  () => import('../../modules/notifications/pages/NotificationsPage')
);

export const PreferencesSettingsPage = lazy(
  () => import('../../modules/user/settings/pages/PreferencesSettingsPage')
);

export const PrivacySettingsPage = lazy(
  () => import('../../modules/user/settings/pages/PrivacySettingsPage')
);

export const MyTrackersPage = lazy(
  () => import('../../modules/user/trackers/pages/MyTrackersPage')
);

export const MyPublishedTrackersPage = lazy(
  () => import('../../modules/user/trackers/pages/MyPublishedTrackersPage')
);

export const TrackerManagePage = lazy(
  () => import('../../modules/user/trackers/pages/TrackerManagePage')
);

export const TrackerRoadmapPage = lazy(
  () => import('../../modules/user/trackers/pages/TrackerRoadmapPage')
);

export const CommunityBrowsePage = lazy(
  () => import('../../modules/user/community/pages/CommunityBrowsePage')
);

export const CommunityPublicTrackerPage = lazy(
  () => import('../../modules/user/community/pages/CommunityPublicTrackerPage')
);

export const CommunityVerifySubmissionPage = lazy(
  () => import('../../modules/user/community/pages/CommunityVerifySubmissionPage')
);

export const VerifyAndEarnPage = lazy(
  () => import('../../modules/user/community/pages/VerifyAndEarnPage')
);

export const ActivityPage = lazy(() => import('../../modules/user/activity/pages/ActivityPage'));

export const SubscriptionPlansPage = lazy(
  () => import('../../modules/user/subscriptions/pages/SubscriptionPlansPage')
);

export const FriendsPage = lazy(() => import('../../modules/user/friends/pages/FriendsPage'));

export const FriendsSearchPage = lazy(
  () => import('../../modules/user/friends/pages/FriendsSearchPage')
);

export const LeaderboardPage = lazy(
  () => import('../../modules/user/leaderboard/pages/LeaderboardPage')
);

export const LeaderboardRewardsPage = lazy(
  () => import('../../modules/user/leaderboard/pages/LeaderboardRewardsPage')
);

export const MockTestsPage = lazy(
  () => import('../../modules/user/mock-tests/pages/MockTestsPage')
);

export const MockTestGeneratingPage = lazy(
  () => import('../../modules/user/mock-tests/pages/MockTestGeneratingPage')
);

export const AdaptiveLearningPage = lazy(
  () => import('../../modules/user/adaptive-learning/pages/AdaptiveLearningPage')
);

export const MockTestAnalysisPage = lazy(
  () => import('../../modules/user/mock-tests/pages/MockTestAnalysisPage')
);

export const MockTestDetailsPage = lazy(
  () => import('../../modules/user/mock-tests/pages/MockTestDetailsPage')
);

export const MockTestResultPage = lazy(
  () => import('../../modules/user/mock-tests/pages/MockTestResultPage')
);

export const RaiseSupportTicketPage = lazy(
  () => import('../../modules/user/support-tickets/pages/RaiseSupportTicketPage')
);
