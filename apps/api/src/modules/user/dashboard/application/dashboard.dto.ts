import type { DashboardRecommendedActionType } from '../domain/value-objects/dashboard-action-type.vo';
import type { DashboardBattleResult } from '../domain/value-objects/dashboard-battle-result.vo';

export interface DashboardRecentItemsQueryDTO {
  limit?: number;
}

export interface DashboardActivityIntensityQueryDTO {
  months?: number;
}

export interface DashboardUserSummaryDTO {
  _id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  isPremium: boolean;
  coinBalance: number;
}

export interface DashboardStreakSummaryDTO {
  current: number;
  longest: number;
  lastActiveAt: Date | null;
}

export interface DashboardActiveTrackerDTO {
  _id: string;
  title: string;
  level: string;
  completionPercentage: number;
  lastStudiedAt: Date | null;
  totalTopics: number;
  completedTopics: number;
  remainingTopics: number;
}

export interface DashboardTrackerSummaryDTO {
  total: number;
  active: number;
  completed: number;
  activeTrackers: DashboardActiveTrackerDTO[];
}

export interface DashboardStatsDTO {
  totalSubtopicsCompleted: number;
  totalPoints: number;
  publishedTrackers: number;
}

export interface DashboardRecentActivityDTO {
  type: string;
  description: string;
  createdAt: Date;
}

export interface DashboardNotificationMetaDTO {
  unreadCount: number;
  hasUnread: boolean;
}

export interface DashboardSummaryDTO {
  user: DashboardUserSummaryDTO;
  streak: DashboardStreakSummaryDTO;
  trackers: DashboardTrackerSummaryDTO;
  stats: DashboardStatsDTO;
  recentActivity: DashboardRecentActivityDTO[];
  notifications: DashboardNotificationMetaDTO;
  isPremium: boolean;
}

export interface DashboardActivityIntensityItemDTO {
  date: string;
  activityCount: number;
  count: number;
}

export interface DashboardFriendItemDTO {
  _id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  lastActiveAt: Date | null;
  isOnline: boolean;
}

export interface DashboardRecommendedActionDTO {
  type: DashboardRecommendedActionType;
  title: string;
  description: string;
  link: string;
}

export interface DashboardBattleItemDTO {
  _id: string;
  opponent: {
    _id: string;
    fullName: string;
    username: string;
    avatarUrl: string;
  } | null;
  myScore?: number;
  opponentScore?: number;
  result: DashboardBattleResult;
  startedAt: Date | null;
  completedAt: Date;
}

export interface DashboardAIInsightResultDTO {
  insight: string;
}
