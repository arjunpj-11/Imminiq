import type {
  ActivityDetails,
  ActivityDifficulty,
} from '../../../domain/entities/user-activity.entity'
import type { ActivityCategory } from '../../../domain/value-objects/activity-category.vo'
import type { ActivityType } from '../../../domain/value-objects/activity-type.vo'
import type { ActivityXpBucket } from '../../../domain/value-objects/activity-xp-bucket.vo'

export type MongoIdLike = {
  toString(): string
}

export type MongoUserActivityRecord = {
  _id: MongoIdLike
  userId: MongoIdLike

  category: ActivityCategory
  type: ActivityType

  title: string
  subtitle?: string

  xpAwarded?: number
  xpBucket?: ActivityXpBucket
  coinsAwarded?: number

  eventKey: string

  trackerId?: MongoIdLike | null
  topicId?: MongoIdLike | null
  subtopicId?: MongoIdLike | null
  mockTestId?: MongoIdLike | null
  attemptId?: MongoIdLike | null
  sourceUserId?: MongoIdLike | null

  details?: {
    scorePercentage?: number
    totalQuestions?: number
    correctAnswers?: number
    durationSeconds?: number
    previousLevel?: number
    currentLevel?: number
    milestoneValue?: number
    previousRank?: number
    currentRank?: number
    difficulty?: ActivityDifficulty
  }

  occurredAt: Date
  deletedAt?: Date | null

  createdAt?: Date
  updatedAt?: Date
}

export type MongoActivityUserRecord = {
  _id: MongoIdLike
  fullName: string
  avatarUrl?: string | null
  isPremium?: boolean
  xp?: number
  teacherXp?: number
  coins?: number
  createdAt: Date
}

export type MongoActivityStatisticsRecord = {
  _id?: null
  sessions?: number
  subtopicsDone?: number
  testsAttempted?: number
  totalQuestions?: number
}

export type MongoActivityDayAggregateRecord = {
  _id: string
  activityCount?: number
  xp?: number
  sessions?: number
}

export type MongoActivityXpRecord = {
  _id?: null
  xp?: number
}

export type MongoActivityBreakdownRecord = {
  _id: ActivityCategory
  xp?: number
}

export type MongoActivityBestDayRecord = {
  _id: string
  xp?: number
}

export type MongoActivityBestWeekRecord = {
  _id: Date
  sessions?: number
}

export type MongoActivityBestTestRecord = {
  _id?: null
  score?: number
}

export type MongoActivityTypeSetRecord = {
  _id?: null
  types?: ActivityType[]
}

export type MongoDuplicateKeyError = {
  code: 11000
  keyPattern?: Record<string, unknown>
  keyValue?: Record<string, unknown>
}

export type MongooseObjectLike<T> = {
  toObject(): T
}

export type MongoActivityDetails = ActivityDetails
