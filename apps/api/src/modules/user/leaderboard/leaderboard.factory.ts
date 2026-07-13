import type { LeaderboardUseCases } from './application/leaderboard-use-cases.contract'
import { LeaderboardMapper } from './application/leaderboard.mapper'
import { LeaderboardDateRange } from './application/services/leaderboard-date-range.service'
import { CaptureLeaderboardSnapshotUseCase } from './application/use-cases/capture-leaderboard-snapshot.usecase'
import { GetLeaderboardRewardsUseCase } from './application/use-cases/get-leaderboard-rewards.usecase'
import { GetLeaderboardUseCase } from './application/use-cases/get-leaderboard.usecase'
import { RecordLeaderboardXpUseCase } from './application/use-cases/record-leaderboard-xp.usecase'
import { ReplaceLeaderboardFriendsUseCase } from './application/use-cases/replace-leaderboard-friends.usecase'
import { mongoLeaderboardRepository } from './infrastructure/repositories/mongo-leaderboard.repository'
import { systemClock } from '../../../infrastructure/time/system-clock'


export type LeaderboardComposition = {
  useCases: LeaderboardUseCases
}

export const createLeaderboardComposition = (): LeaderboardComposition => {
  const leaderboardRepository = mongoLeaderboardRepository
  const leaderboardMapper = new LeaderboardMapper()
  const dateRange = new LeaderboardDateRange()

  return {
    useCases: {
      getLeaderboard: new GetLeaderboardUseCase(
        leaderboardRepository,
        leaderboardMapper,
        dateRange,
        systemClock,
      ),
      getRewards: new GetLeaderboardRewardsUseCase(),
      recordXp: new RecordLeaderboardXpUseCase(
        leaderboardRepository,
        systemClock,
      ),
      replaceFriends: new ReplaceLeaderboardFriendsUseCase(
        leaderboardRepository,
      ),
      captureSnapshot: new CaptureLeaderboardSnapshotUseCase(
        leaderboardRepository,
        dateRange,
        systemClock,
      ),
    },
  }
}

export const leaderboardComposition = createLeaderboardComposition()
