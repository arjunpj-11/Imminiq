export type LeaderboardSection = 'students' | 'trainers';
export type LeaderboardScope = 'global' | 'friends' | 'weekly';

export interface ILeaderboardEntry {
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
  avatarUrl?: string | null;
  avatarColor: string;
  initials: string;
  isMe: boolean;
}

export interface ILeaderboardTopThreeEntry extends ILeaderboardEntry {
  rank: 1 | 2 | 3;
  streakDays: number;
  isChampion: boolean;
}

export interface ILeaderboardCurrentUser extends ILeaderboardEntry {
  xpToTargetRank: number | null;
  targetRank: number;
}

export interface ILeaderboardWeeklySummary {
  currentXp: number;
  previousXp: number;
  growthPercent: number;
  tierTargetXp: number;
  xpToNextTier: number;
  progressPercent: number;
}

export interface ILeaderboardScoringRule {
  label: string;
  xpLabel: string;
  source: string;
}

export interface ILeaderboardReward {
  title: string;
  description: string;
  targetRank: number;
  badgeName: string;
  coins: number;
}

export interface ILeaderboardResponse {
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
  topThree: ILeaderboardTopThreeEntry[];
  entries: ILeaderboardEntry[];
  currentUser: ILeaderboardCurrentUser | null;
  streakChampions: ILeaderboardEntry[];
  weekly: ILeaderboardWeeklySummary;
  scoringRules: ILeaderboardScoringRule[];
  reward: ILeaderboardReward;
  pagination: {
    limit: number;
    returned: number;
    participantCount: number;
  };
}

export interface ILeaderboardRewardsResponse {
  students: {
    scoringRules: ILeaderboardScoringRule[];
    reward: ILeaderboardReward;
  };
  trainers: {
    scoringRules: ILeaderboardScoringRule[];
    reward: ILeaderboardReward;
  };
}

export interface ILeaderboardApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ILeaderboardApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
}

export interface ILeaderboardQueryInput {
  section: LeaderboardSection;
  scope: LeaderboardScope;
  limit?: number;
}
