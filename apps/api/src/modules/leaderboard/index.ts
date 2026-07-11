export { leaderboardService } from './leaderboard.service'
export type { LeaderboardService } from './leaderboard.service'

export type {
  CaptureLeaderboardSnapshotResultViewDTO,
  GetLeaderboardPayloadDTO,
  LeaderboardCurrentUserViewDTO,
  LeaderboardEntryViewDTO,
  LeaderboardResponseDTO,
  LeaderboardRewardsResponseDTO,
  LeaderboardTopThreeViewDTO,
  LeaderboardWeeklySummaryViewDTO,
  RecordLeaderboardXpPayloadDTO,
  ReplaceLeaderboardFriendsPayloadDTO,
} from './application/dtos/leaderboard.dto'

export type {
  LeaderboardScope,
  LeaderboardSection,
  LeaderboardXpActivitySource,
} from './domain/types/leaderboard.types'
