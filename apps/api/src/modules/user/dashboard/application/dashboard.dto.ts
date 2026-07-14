import type { DashboardRecommendedActionType } from '../domain/value-objects/dashboard-action-type.vo';
import type { DashboardBattleResult } from '../domain/value-objects/dashboard-battle-result.vo';

export interface IDashboardRecentItemsQueryDTO {
  limit?: number;
}

export interface IDashboardActivityIntensityQueryDTO {
  months?: number;
}

export interface IDashboardUserSummaryDTO {
  _id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  isPremium: boolean;
  coinBalance: number;
}

export interface IDashboardStreakSummaryDTO {
  current: number;
  longest: number;
  lastActiveAt: Date | null;
}

export interface IDashboardActiveTrackerDTO {
  _id: string;
  title: string;
  level: string;
  completionPercentage: number;
  lastStudiedAt: Date | null;
  totalTopics: number;
  completedTopics: number;
  remainingTopics: number;
}

export interface IDashboardTrackerSummaryDTO {
  total: number;
  active: number;
  completed: number;
  activeTrackers: IDashboardActiveTrackerDTO[];
}

export interface IDashboardStatsDTO {
  totalSubtopicsCompleted: number;
  totalPoints: number;
  publishedTrackers: number;
}

export interface IDashboardRecentActivityDTO {
  type: string;
  description: string;
  createdAt: Date;
}

export interface IDashboardNotificationMetaDTO {
  unreadCount: number;
  hasUnread: boolean;
}

export interface IDashboardSummaryDTO {
  user: IDashboardUserSummaryDTO;
  streak: IDashboardStreakSummaryDTO;
  trackers: IDashboardTrackerSummaryDTO;
  stats: IDashboardStatsDTO;
  recentActivity: IDashboardRecentActivityDTO[];
  notifications: IDashboardNotificationMetaDTO;
  isPremium: boolean;
}

export interface IDashboardActivityIntensityItemDTO {
  date: string;
  activityCount: number;
  count: number;
}

export interface IDashboardFriendItemDTO {
  _id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  lastActiveAt: Date | null;
  isOnline: boolean;
}

export interface IDashboardRecommendedActionDTO {
  type: DashboardRecommendedActionType;
  title: string;
  description: string;
  link: string;
}

export interface IDashboardBattleItemDTO {
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

export interface IDashboardAIInsightResultDTO {
  insight: string;
}
