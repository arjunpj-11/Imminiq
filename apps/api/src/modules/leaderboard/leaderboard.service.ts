import type {
  GetLeaderboardPayload,
  RecordLeaderboardXpPayload,
  ReplaceLeaderboardFriendsPayload,
} from './application/dtos/leaderboard.dto'
import {
  createLeaderboardComposition,
  type LeaderboardComposition,
} from './leaderboard.factory'

export class LeaderboardService {
  private readonly _useCases: LeaderboardComposition['useCases']

  constructor(composition: LeaderboardComposition) {
    this._useCases = composition.useCases
  }

  getLeaderboard(
    viewerUserId: string,
    payload: GetLeaderboardPayload,
  ) {
    return this._useCases.getLeaderboard.execute(
      viewerUserId,
      payload,
    )
  }

  getRewards() {
    return this._useCases.getRewards.execute()
  }

  recordXpActivity(payload: RecordLeaderboardXpPayload) {
    return this._useCases.recordXp.execute(payload)
  }

  replaceFriendUserIds(
    payload: ReplaceLeaderboardFriendsPayload,
  ) {
    return this._useCases.replaceFriends.execute(payload)
  }

  captureRankSnapshot(capturedAt?: Date) {
    return this._useCases.captureSnapshot.execute(capturedAt)
  }
}

export const leaderboardService = new LeaderboardService(
  createLeaderboardComposition(),
)
