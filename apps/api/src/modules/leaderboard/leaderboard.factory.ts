import { LeaderboardMapper } from './application/mappers/leaderboard.mapper'
import { LeaderboardDateRangeService } from './application/services/leaderboard-date-range.service'
import { CaptureLeaderboardSnapshotUseCase } from './application/use-cases/capture-leaderboard-snapshot.usecase'
import { GetLeaderboardRewardsUseCase } from './application/use-cases/get-leaderboard-rewards.usecase'
import { GetLeaderboardUseCase } from './application/use-cases/get-leaderboard.usecase'
import { RecordLeaderboardXpUseCase } from './application/use-cases/record-leaderboard-xp.usecase'
import { ReplaceLeaderboardFriendsUseCase } from './application/use-cases/replace-leaderboard-friends.usecase'
import { mongoLeaderboardRepository } from './infrastructure/repositories/mongo-leaderboard.repository'

export type LeaderboardUseCases = {
  getLeaderboard: GetLeaderboardUseCase
  getRewards: GetLeaderboardRewardsUseCase
  recordXp: RecordLeaderboardXpUseCase
  replaceFriends: ReplaceLeaderboardFriendsUseCase
  captureSnapshot: CaptureLeaderboardSnapshotUseCase
}

export type LeaderboardComposition = {
  useCases: LeaderboardUseCases
}

export const createLeaderboardComposition = (): LeaderboardComposition => {
  const leaderboardRepository = mongoLeaderboardRepository
  const leaderboardMapper = new LeaderboardMapper()
  const dateRangeService = new LeaderboardDateRangeService()

  return {
    useCases: {
      getLeaderboard: new GetLeaderboardUseCase(
        leaderboardRepository,
        leaderboardMapper,
        dateRangeService,
      ),
      getRewards: new GetLeaderboardRewardsUseCase(),
      recordXp: new RecordLeaderboardXpUseCase(
        leaderboardRepository,
      ),
      replaceFriends: new ReplaceLeaderboardFriendsUseCase(
        leaderboardRepository,
      ),
      captureSnapshot: new CaptureLeaderboardSnapshotUseCase(
        leaderboardRepository,
        dateRangeService,
      ),
    },
  }
}
