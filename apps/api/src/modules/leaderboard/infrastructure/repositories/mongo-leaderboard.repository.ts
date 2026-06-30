import type {
  CaptureLeaderboardSnapshotInput,
  RecordLeaderboardXpActivityInput,
  ReplaceLeaderboardFriendsInput,
} from '../../domain/repositories/leaderboard-activity.repository.interface'
import type { FindLeaderboardInput } from '../../domain/repositories/leaderboard-query.repository.interface'
import type { LeaderboardRepositoryContract } from '../../domain/repositories/leaderboard.repository.interface'
import { MongoLeaderboardActivityRepository } from './internal/mongo-leaderboard-activity.repository'
import { MongoLeaderboardQueryRepository } from './internal/mongo-leaderboard-query.repository'

export class MongoLeaderboardRepository
  implements LeaderboardRepositoryContract
{
  constructor(
    private readonly _queryRepository =
      new MongoLeaderboardQueryRepository(),
    private readonly _activityRepository =
      new MongoLeaderboardActivityRepository(),
  ) {}

  findLeaderboard(input: FindLeaderboardInput) {
    return this._queryRepository.findLeaderboard(input)
  }

  recordXpActivity(input: RecordLeaderboardXpActivityInput) {
    return this._activityRepository.recordXpActivity(input)
  }

  replaceFriendUserIds(input: ReplaceLeaderboardFriendsInput) {
    return this._activityRepository.replaceFriendUserIds(input)
  }

  captureRankSnapshot(input: CaptureLeaderboardSnapshotInput) {
    return this._activityRepository.captureRankSnapshot(input)
  }
}

export const mongoLeaderboardRepository =
  new MongoLeaderboardRepository()
