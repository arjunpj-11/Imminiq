import type { LeaderboardEntryEntity } from '../entities/leaderboard-entry.entity'
import type {
  LeaderboardScope,
  LeaderboardSection,
  LeaderboardTimeRange,
} from '../types/leaderboard.types'

export type FindLeaderboardInput = {
  viewerUserId: string
  section: LeaderboardSection
  scope: LeaderboardScope
  limit: number
  currentPeriod: LeaderboardTimeRange
  previousPeriod: LeaderboardTimeRange
  previousSnapshotBefore: Date
  targetRank: number
  streakChampionLimit: number
}

export type LeaderboardQueryResult = {
  topEntries: LeaderboardEntryEntity[]
  viewerEntry: LeaderboardEntryEntity | null
  globalViewerEntry: LeaderboardEntryEntity | null
  streakChampions: LeaderboardEntryEntity[]
  selectedParticipantCount: number
  activeStudentCount: number
  activeTrainerCount: number
  targetRankScore: number | null
  weeklyScore: number
  previousWeeklyScore: number
}

export interface ILeaderboardQueryRepository {
  findLeaderboard(input: FindLeaderboardInput): Promise<LeaderboardQueryResult>
}
