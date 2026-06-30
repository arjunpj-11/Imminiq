import type { UserActivityEntity } from '../entities/user-activity.entity'
import type {
  ActivityAnalyticsRecord,
  ActivityTimeRange,
} from '../types/activity.types'
import type { ActivityCategory } from '../value-objects/activity-category.vo'

export type FindActivityFeedInput = {
  userId: string
  categories?: ActivityCategory[]
  limit: number
  beforeOccurredAt?: Date
  beforeId?: string
}

export type FindActivityFeedResult = {
  activities: UserActivityEntity[]
  hasMore: boolean
}

export type FindActivityAnalyticsInput = {
  userId: string
  yearRange: ActivityTimeRange
  currentWeekRange: ActivityTimeRange
  previousWeekRange: ActivityTimeRange
  todayRange: ActivityTimeRange
  timezone: string
}

export type FindDailyGoalStateInput = {
  userId: string
  todayRange: ActivityTimeRange
}

export interface ActivityQueryRepositoryContract {
  findActivityFeed(
    input: FindActivityFeedInput,
  ): Promise<FindActivityFeedResult>

  findActivityAnalytics(
    input: FindActivityAnalyticsInput,
  ): Promise<ActivityAnalyticsRecord>

  findDailyGoalState(
    input: FindDailyGoalStateInput,
  ): Promise<{
    subtopicCompleted: boolean
    mockTestCompleted: boolean
  }>
}
