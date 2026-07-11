import { leaderboardService } from '../../../leaderboard/leaderboard.service'
import type { LeaderboardXpRecorderContract } from '../../../leaderboard/leaderboard.service'
import type {
  ActivityLeaderboardRecorderContract,
  RecordActivityLeaderboardXpInput,
} from '../../domain/services/activity-leaderboard-recorder.service.interface'

export class LeaderboardActivityGateway
  implements ActivityLeaderboardRecorderContract
{
  constructor(
    private readonly _leaderboardRecorder: LeaderboardXpRecorderContract,
  ) {}
  async recordXp(
    input: RecordActivityLeaderboardXpInput,
  ): Promise<void> {
    if (
      input.amount <= 0 ||
      input.bucket === 'none'
    ) {
      return
    }

    await this._leaderboardRecorder.recordXpActivity({
      userId: input.userId,

      section:
        input.bucket === 'learning'
          ? 'students'
          : 'trainers',

      amount: input.amount,
      source: input.type,

      /*
       * The Activity ID is stable and short enough for the
       * leaderboard idempotency-key limit.
       */
      idempotencyKey:
        `activity-xp:${input.activityId}`,

      sourceEntityId: input.activityId,
      occurredAt: input.occurredAt,

      metadata: {
        activityEventKey: input.eventKey,
        activityType: input.type,
        xpBucket: input.bucket,
      },
    })
  }
}

export const leaderboardActivityGateway =
  new LeaderboardActivityGateway(leaderboardService)
