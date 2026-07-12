import type * as Application from '../index'
export type LeaderboardUseCases = {
  getLeaderboard: Application.GetLeaderboardUseCase
  getRewards: Application.GetLeaderboardRewardsUseCase
  recordXp: Application.RecordLeaderboardXpUseCase
  replaceFriends: Application.ReplaceLeaderboardFriendsUseCase
  captureSnapshot: Application.CaptureLeaderboardSnapshotUseCase
}
