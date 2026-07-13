import type { DashboardIntensityLevel } from '../../../domain/value-objects/dashboard-intensity-level.vo'

export type MongoIdLike = {
  toString(): string
}

export type MongoUserRecord = {
  _id: MongoIdLike
  fullName: string
  username: string
  avatarUrl?: string | null
  isPremium?: boolean
  coins?: number | null
  lastActiveAt?: Date | null
}

export type MongoUserProfileRecord = {
  userId: MongoIdLike | string
  avatarUrl?: string | null
}

export type MongoStreakSnapshotRecord = {
  currentStreak?: number | null
  longestStreak?: number | null
  snapshotDate?: Date | null
}

export type MongoTrackerRecord = {
  _id: MongoIdLike
  title: string
  level?: string | null
  updatedAt?: Date | null
  topicsCount?: number | null
}

export type MongoTrackerProgressRecord = {
  trackerId: MongoIdLike | string
  completionPercentage?: number | null
  lastStudiedAt?: Date | null
  completedTopics?: number | null
}

export type MongoProgressAggregationRecord = {
  totalSubtopicsCompleted?: number | null
}

export type MongoNotificationRecord = {
  type: string
  message: string
  createdAt: Date
}

export type MongoStreakHistoryRecord = {
  date: Date
  activityCount?: number | null
  intensityLevel?: DashboardIntensityLevel | null
  isFrozen?: boolean | null
}

export type MongoBattleRecord = {
  _id: MongoIdLike
  playerOneId: MongoIdLike | string
  playerTwoId: MongoIdLike | string
  winnerId?: MongoIdLike | string | null
  playerOneScore?: number | null
  playerTwoScore?: number | null
  startedAt?: Date | null
  endedAt?: Date | null
  updatedAt: Date
}

export type MongoFriendRecord = {
  userId: MongoIdLike | string
  friendId: MongoIdLike | string
}

export type MongoTrackerTitleRecord = {
  _id: MongoIdLike
  title: string
}
