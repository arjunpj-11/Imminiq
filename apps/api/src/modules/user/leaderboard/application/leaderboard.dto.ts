import type {
  LeaderboardScope,
  LeaderboardSection,
  LeaderboardXpActivitySource,
} from '../domain/leaderboard.types';

export type GetLeaderboardPayloadDTO = {
  section: LeaderboardSection;
  scope: LeaderboardScope;
  limit?: number;
};

export type RecordLeaderboardXpPayloadDTO = {
  userId: string;
  section: LeaderboardSection;
  amount: number;
  source: LeaderboardXpActivitySource;
  idempotencyKey: string;
  sourceEntityId?: string;
  occurredAt?: Date;
  metadata?: Record<string, unknown>;
};

export type ReplaceLeaderboardFriendsPayloadDTO = {
  userId: string;
  friendUserIds: string[];
};

export type LeaderboardEntryViewDTO = {
  userId: string;
  rank: number;
  name: string;
  username: string;
  handle: string;
  track: string;
  xp: number;
  totalXp: number;
  level: number;
  streak: number;
  trend: number;
  avatarUrl: string | null | undefined;
  avatarColor: string;
  initials: string;
  isMe: boolean;
};

export type LeaderboardTopThreeViewDTO = LeaderboardEntryViewDTO & {
  rank: 1 | 2 | 3;
  streakDays: number;
  isChampion: boolean;
};

export type LeaderboardCurrentUserViewDTO = LeaderboardEntryViewDTO & {
  xpToTargetRank: number | null;
  targetRank: number;
};

export type LeaderboardWeeklySummaryViewDTO = {
  currentXp: number;
  previousXp: number;
  growthPercent: number;
  tierTargetXp: number;
  xpToNextTier: number;
  progressPercent: number;
};

export type LeaderboardResponseDTO = {
  section: LeaderboardSection;
  scope: LeaderboardScope;
  generatedAt: string;
  counts: {
    students: number;
    trainers: number;
  };
  summary: {
    globalRank: number | null;
    globalRankTrend: number;
  };
  topThree: LeaderboardTopThreeViewDTO[];
  entries: LeaderboardEntryViewDTO[];
  currentUser: LeaderboardCurrentUserViewDTO | null;
  streakChampions: LeaderboardEntryViewDTO[];
  weekly: LeaderboardWeeklySummaryViewDTO;
  scoringRules: Array<{
    label: string;
    xpLabel: string;
    source: string;
  }>;
  reward: {
    title: string;
    description: string;
    targetRank: number;
    badgeName: string;
    coins: number;
  };
  pagination: {
    limit: number;
    returned: number;
    participantCount: number;
  };
};

export type LeaderboardRewardsResponseDTO = {
  students: {
    scoringRules: LeaderboardResponseDTO['scoringRules'];
    reward: LeaderboardResponseDTO['reward'];
  };
  trainers: {
    scoringRules: LeaderboardResponseDTO['scoringRules'];
    reward: LeaderboardResponseDTO['reward'];
  };
};

export type CaptureLeaderboardSnapshotResultViewDTO = {
  snapshotKey: string;
  capturedAt: string;
  students: number;
  trainers: number;
};
