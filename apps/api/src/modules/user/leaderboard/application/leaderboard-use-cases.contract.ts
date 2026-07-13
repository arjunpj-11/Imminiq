import type * as Application from './index'
export type LeaderboardUseCases = {
  getLeaderboard: Application.IGetLeaderboardUseCase
  getRewards: Application.IGetLeaderboardRewardsUseCase
  recordXp: Application.IRecordLeaderboardXpUseCase
  replaceFriends: Application.IReplaceLeaderboardFriendsUseCase
  captureSnapshot: Application.ICaptureLeaderboardSnapshotUseCase
}
