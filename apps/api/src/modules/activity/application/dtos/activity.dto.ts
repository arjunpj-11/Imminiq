import type { ActivityDetails } from '../../domain/entities/user-activity.entity'
import type { ActivityFeedFilter } from '../../domain/value-objects/activity-category.vo'
import type { ActivityHeatmapIntensity } from '../../domain/value-objects/activity-heatmap-intensity.vo'
import type { ActivityType } from '../../domain/value-objects/activity-type.vo'
import type { ActivityXpBucket } from '../../domain/value-objects/activity-xp-bucket.vo'
import type { ActivityCategory } from '../../domain/value-objects/activity-category.vo'

export type GetActivityPagePayload = {
  year?: number
  filter?: ActivityFeedFilter
  limit?: number
  cursor?: string
  utcOffsetMinutes?: number
}

export type GetActivityFeedPayload = {
  filter?: ActivityFeedFilter
  limit?: number
  cursor?: string
  utcOffsetMinutes?: number
}

export type RecordUserActivityPayload = {
  userId: string

  category: ActivityCategory
  type: ActivityType

  title: string
  subtitle?: string

  xpAwarded?: number
  xpBucket?: ActivityXpBucket
  coinsAwarded?: number

  eventKey: string

  trackerId?: string
  topicId?: string
  subtopicId?: string
  mockTestId?: string
  attemptId?: string
  sourceUserId?: string

  details?: ActivityDetails
  occurredAt?: Date
  utcOffsetMinutes?: number
}

export type ActivityEventIcon =
  | 'tracker'
  | 'test'
  | 'community'
  | 'fire'
  | 'star'

export type ActivityEventView = {
  id: string
  category: ActivityCategory
  type: ActivityType
  icon: ActivityEventIcon

  title: string
  subtitle: string

  xp: number
  xpBucket: ActivityXpBucket
  coins: number

  occurredAt: string
  date: string

  details: ActivityDetails

  references: {
    trackerId: string | null
    topicId: string | null
    subtopicId: string | null
    mockTestId: string | null
    attemptId: string | null
    sourceUserId: string | null
  }
}

export type ActivityFeedGroupView = {
  date: string
  label: string
  events: ActivityEventView[]
}

export type ActivityFeedResponse = {
  filter: ActivityFeedFilter
  groups: ActivityFeedGroupView[]
  pagination: {
    limit: number
    returned: number
    hasMore: boolean
    nextCursor: string | null
  }
}

export type ActivityHeatmapItemView = {
  date: string
  intensityLevel: ActivityHeatmapIntensity
  activityCount: number
  isFrozen: boolean
}

export type ActivityWeekDayView = {
  date: string
  label: string
  xp: number
  sessions: number
}

export type ActivityPageResponse = {
  generatedAt: string

  user: {
    userId: string
    fullName: string
    avatarUrl: string | null | undefined
    isPremium: boolean
    accountCreatedAt: string
  }

  stats: {
    totalXp: number
    learningXp: number
    teacherXp: number
    coins: number
    sessions: number
    subtopicsDone: number
    testsAttempted: number
    totalQuestions: number
  }

  streak: {
    currentStreak: number
    longestStreak: number
    heatmap: ActivityHeatmapItemView[]
  }

  weekly: {
    days: ActivityWeekDayView[]
    currentXp: number
    previousXp: number
    growthPercent: number
    targetXp: number
    xpToTarget: number
    progressPercent: number
    breakdown: {
      trackerXp: number
      testXp: number
      communityXp: number
      streakXp: number
      milestoneXp: number
    }
  }

  personalBests: {
    bestDayXp: number
    longestStreak: number
    bestWeekSessions: number
    bestTestScore: number
  }

  dailyGoal: {
    tasks: Array<{
      key: 'subtopic' | 'mock_test'
      label: string
      completed: boolean
    }>
    completedTasks: number
    totalTasks: number
    rewardXp: number
    completed: boolean
    progressPercent: number
  }

  feed: ActivityFeedResponse
}

export type RecordUserActivityResponse = {
  activity: ActivityEventView
  created: boolean
  dailyGoalAwarded: boolean
}
