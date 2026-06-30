export type LeaderboardSection = 'students' | 'trainers'
export type LeaderboardScope = 'global' | 'friends' | 'weekly'

export interface LeaderboardEntry {
  userId: string
  rank: number
  name: string
  handle: string
  track: string
  xp: number
  totalXp: number
  level: number
  streak: number
  trend: number
  avatarUrl?: string | null
  avatarColor: string
  initials: string
  isMe: boolean
}

export interface LeaderboardTopThreeEntry extends LeaderboardEntry {
  rank: 1 | 2 | 3
  streakDays: number
  isChampion: boolean
}

export interface LeaderboardCurrentUser extends LeaderboardEntry {
  xpToTargetRank: number | null
  targetRank: number
}

export interface LeaderboardWeeklySummary {
  currentXp: number
  previousXp: number
  growthPercent: number
  tierTargetXp: number
  xpToNextTier: number
  progressPercent: number
}

export interface LeaderboardScoringRule {
  label: string
  xpLabel: string
  source: string
}

export interface LeaderboardReward {
  title: string
  description: string
  targetRank: number
  badgeName: string
  coins: number
}

export interface LeaderboardResponse {
  section: LeaderboardSection
  scope: LeaderboardScope
  generatedAt: string
  counts: {
    students: number
    trainers: number
  }
  summary: {
    globalRank: number | null
    globalRankTrend: number
  }
  topThree: LeaderboardTopThreeEntry[]
  entries: LeaderboardEntry[]
  currentUser: LeaderboardCurrentUser | null
  streakChampions: LeaderboardEntry[]
  weekly: LeaderboardWeeklySummary
  scoringRules: LeaderboardScoringRule[]
  reward: LeaderboardReward
  pagination: {
    limit: number
    returned: number
    participantCount: number
  }
}

export interface LeaderboardRewardsResponse {
  students: {
    scoringRules: LeaderboardScoringRule[]
    reward: LeaderboardReward
  }
  trainers: {
    scoringRules: LeaderboardScoringRule[]
    reward: LeaderboardReward
  }
}

export interface LeaderboardApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface LeaderboardApiErrorResponse {
  success?: boolean
  message?: string
  code?: string
}

export interface LeaderboardQueryInput {
  section: LeaderboardSection
  scope: LeaderboardScope
  limit?: number
}
