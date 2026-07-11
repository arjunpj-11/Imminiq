import type {
  ActivityDetails,
  UserActivityEntity,
} from '../entities/user-activity.entity'
import type {
  ActivityProgressionChange,
  ActivityTimeRange,
} from '../types/activity.types'
import type { ActivityCategory } from '../value-objects/activity-category.vo'
import type { ActivityType } from '../value-objects/activity-type.vo'
import type { ActivityXpBucket } from '../value-objects/activity-xp-bucket.vo'

export type RecordUserActivityInput = {
  userId: string

  category: ActivityCategory
  type: ActivityType

  title: string
  subtitle: string

  xpAwarded: number
  xpBucket: ActivityXpBucket
  coinsAwarded: number

  eventKey: string
  activityDateKey: string
  activityDayRange: ActivityTimeRange
  previousDayRange: ActivityTimeRange

  trackerId?: string
  topicId?: string
  subtopicId?: string
  mockTestId?: string
  attemptId?: string
  sourceUserId?: string

  details: ActivityDetails
  occurredAt: Date
}

export type RecordUserActivityResult = {
  activity: UserActivityEntity
  created: boolean
  progression?: ActivityProgressionChange
}

export interface IActivityCommandRepository {
  recordActivityAndApplyReward(
    input: RecordUserActivityInput,
  ): Promise<RecordUserActivityResult>
}
