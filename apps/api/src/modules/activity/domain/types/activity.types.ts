import type { ActivityCategory } from '../value-objects/activity-category.vo'
import type { ActivityType } from '../value-objects/activity-type.vo'

export type ActivityTimeRange = {
  start: Date
  end: Date
}

export type ActivityUserSummaryRecord = {
  userId: string
  fullName: string
  avatarUrl: string | null | undefined
  isPremium: boolean
  accountCreatedAt: Date

  learningXp: number
  teacherXp: number
  coins: number
}

export type ActivityStatisticsRecord = {
  sessions: number
  subtopicsDone: number
  testsAttempted: number
  totalQuestions: number
}

export type ActivityDayAggregateRecord = {
  date: string
  activityCount: number
  xp: number
  sessions: number
}

export type ActivityWeeklyBreakdownRecord = {
  tracker: number
  mockTest: number
  community: number
  streak: number
  xpMilestone: number
}

export type ActivityPersonalBestsRecord = {
  bestDayXp: number
  bestWeekSessions: number
  bestTestScore: number
}

export type ActivityDailyGoalState = {
  subtopicCompleted: boolean
  mockTestCompleted: boolean
}

export type ActivityAnalyticsRecord = {
  user: ActivityUserSummaryRecord | null
  statistics: ActivityStatisticsRecord

  yearDays: ActivityDayAggregateRecord[]
  activeDateKeys: string[]

  currentWeekDays: ActivityDayAggregateRecord[]
  previousWeekXp: number
  currentWeekBreakdown: ActivityWeeklyBreakdownRecord

  personalBests: ActivityPersonalBestsRecord
  dailyGoal: ActivityDailyGoalState
}

export type ActivityProgressionChange = {
  previousLearningXp: number
  currentLearningXp: number
  previousLearningLevel: number
  currentLearningLevel: number

  previousTeacherXp: number
  currentTeacherXp: number
  previousTeacherLevel: number
  currentTeacherLevel: number

  previousCoins: number
  currentCoins: number
}

export type ActivityReferenceIds = {
  trackerId?: string
  topicId?: string
  subtopicId?: string
  mockTestId?: string
  attemptId?: string
  sourceUserId?: string
}

export type ActivityRecordCore = ActivityReferenceIds & {
  userId: string
  category: ActivityCategory
  type: ActivityType
  eventKey: string
}

export type ActivityCategoryTotals = Record<ActivityCategory, number>
