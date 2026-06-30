import type { ActivityType } from '../value-objects/activity-type.vo'
import type { ActivityXpBucket } from '../value-objects/activity-xp-bucket.vo'

export type RecordActivityLeaderboardXpInput = {
  userId: string
  activityId: string
  eventKey: string
  type: ActivityType
  bucket: ActivityXpBucket
  amount: number
  occurredAt: Date
}

export interface ActivityLeaderboardRecorderContract {
  recordXp(
    input: RecordActivityLeaderboardXpInput,
  ): Promise<void>
}
