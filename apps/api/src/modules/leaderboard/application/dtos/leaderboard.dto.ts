import type {
  LeaderboardScope,
  LeaderboardSection,
  LeaderboardXpActivitySource,
} from '../../domain/types/leaderboard.types'

export type GetLeaderboardPayload = {
  section: LeaderboardSection
  scope: LeaderboardScope
  limit?: number
}

export type RecordLeaderboardXpPayload = {
  userId: string
  section: LeaderboardSection
  amount: number
  source: LeaderboardXpActivitySource
  idempotencyKey: string
  sourceEntityId?: string
  occurredAt?: Date
  metadata?: Record<string, unknown>
}

export type ReplaceLeaderboardFriendsPayload = {
  userId: string
  friendUserIds: string[]
}

export type LeaderboardEntryView = {
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
  avatarUrl: string | null | undefined
  avatarColor: string
  initials: string
  isMe: boolean
}

export type LeaderboardTopThreeView = LeaderboardEntryView & {
  rank: 1 | 2 | 3
  streakDays: number
  isChampion: boolean
}

export type LeaderboardCurrentUserView = LeaderboardEntryView & {
  xpToTargetRank: number | null
  targetRank: number
}

export type LeaderboardWeeklySummaryView = {
  currentXp: number
  previousXp: number
  growthPercent: number
  tierTargetXp: number
  xpToNextTier: number
  progressPercent: number
}

export type LeaderboardResponse = {
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
  topThree: LeaderboardTopThreeView[]
  entries: LeaderboardEntryView[]
  currentUser: LeaderboardCurrentUserView | null
  streakChampions: LeaderboardEntryView[]
  weekly: LeaderboardWeeklySummaryView
  scoringRules: Array<{
    label: string
    xpLabel: string
    source: string
  }>
  reward: {
    title: string
    description: string
    targetRank: number
    badgeName: string
    coins: number
  }
  pagination: {
    limit: number
    returned: number
    participantCount: number
  }
}

export type LeaderboardRewardsResponse = {
  students: {
    scoringRules: LeaderboardResponse['scoringRules']
    reward: LeaderboardResponse['reward']
  }
  trainers: {
    scoringRules: LeaderboardResponse['scoringRules']
    reward: LeaderboardResponse['reward']
  }
}

export type CaptureLeaderboardSnapshotResultView = {
  snapshotKey: string
  capturedAt: string
  students: number
  trainers: number
}
