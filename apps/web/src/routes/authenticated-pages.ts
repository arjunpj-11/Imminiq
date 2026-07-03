import { lazy } from 'react'

export const DashboardPage = lazy(
  () => import('../modules/dashboard/pages/DashboardPage'),
)

export const ProfilePage = lazy(
  () => import('../modules/users/pages/ProfilePage'),
)

export const AccountSecuritySettingsPage = lazy(
  () => import('../modules/settings/pages/AccountSecuritySettingsPage'),
)

export const NotificationSettingsPage = lazy(
  () => import('../modules/settings/pages/NotificationSettingsPage'),
)

export const PreferencesSettingsPage = lazy(
  () => import('../modules/settings/pages/PreferencesSettingsPage'),
)

export const PrivacySettingsPage = lazy(
  () => import('../modules/settings/pages/PrivacySettingsPage'),
)

export const MyTrackersPage = lazy(
  () => import('../modules/trackers/pages/MyTrackersPage'),
)

export const MyPublishedTrackersPage = lazy(
  () => import('../modules/trackers/pages/MyPublishedTrackersPage'),
)

export const TrackerManagePage = lazy(
  () => import('../modules/trackers/pages/TrackerManagePage'),
)

export const TrackerRoadmapPage = lazy(
  () => import('../modules/trackers/pages/TrackerRoadmapPage'),
)

export const CommunityBrowsePage = lazy(
  () => import('../modules/community/pages/CommunityBrowsePage'),
)

export const CommunityPublicTrackerPage = lazy(
  () => import('../modules/community/pages/CommunityPublicTrackerPage'),
)

export const CommunityVerifySubmissionPage = lazy(
  () => import('../modules/community/pages/CommunityVerifySubmissionPage'),
)

export const VerifyAndEarnPage = lazy(
  () => import('../modules/community/pages/VerifyAndEarnPage'),
)

export const ActivityPage = lazy(
  () => import('../modules/activity/pages/ActivityPage'),
)

export const FriendsPage = lazy(
  () => import('../modules/friends/pages/FriendsPage'),
)

export const FriendsSearchPage = lazy(
  () => import('../modules/friends/pages/FriendsSearchPage'),
)

export const LeaderboardPage = lazy(
  () => import('../modules/leaderboard/pages/LeaderboardPage'),
)

export const LeaderboardRewardsPage = lazy(
  () => import('../modules/leaderboard/pages/LeaderboardRewardsPage'),
)

export const MockTestsPage = lazy(
  () => import('../modules/mock-tests/pages/MockTestsPage'),
)

export const MockTestAnalysisPage = lazy(
  () => import('../modules/mock-tests/pages/MockTestAnalysisPage'),
)

export const MockTestDetailsPage = lazy(
  () => import('../modules/mock-tests/pages/MockTestDetailsPage'),
)

export const MockTestResultPage = lazy(
  () => import('../modules/mock-tests/pages/MockTestResultPage'),
)