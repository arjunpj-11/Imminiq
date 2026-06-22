import type { Types } from 'mongoose'

import type { VerificationSubmissionStatus } from '../../domain/value-objects/verification-submission-status.vo'
import type { VerificationVoteChoice } from '../../domain/value-objects/verification-vote-choice.vo'

export type MongoIdLike = string | Types.ObjectId

export type MongooseObjectLike<T> = T & {
  toObject?: () => T
}

export type MongoCommunityTrackerRecord = {
  _id: MongoIdLike
  ownerId: MongoIdLike
  title: string
  slug: string
  description?: string
  category?: string
  field?: string
  goal?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
  allowClone?: boolean
  sourceTrackerId?: MongoIdLike | null
  visibility?: 'private' | 'public' | 'unlisted'
  status?: 'draft' | 'active' | 'archived'
  verificationStatus?: 'pending' | 'verified' | 'rejected' | null
  verifiedAt?: Date | string | null
  isAIGenerated?: boolean
  coverImageUrl?: string
  topicsCount?: number
  subtopicsCount?: number
  cloneCount?: number
  likeCount?: number
  saveCount?: number
  progressPercent?: number
  ratingAverage?: number
  ratingCount?: number
  publishedAt?: Date | string | null
  deletedAt?: Date | string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  inDashboard?: boolean
  [key: string]: unknown
}

export type MongoTrackerProgressRecord = {
  _id: MongoIdLike
  userId: MongoIdLike
  trackerId: MongoIdLike
  totalTopics?: number
  completedTopics?: number
  totalSubtopics?: number
  completedSubtopics?: number
  completionPercentage?: number
  lastStudiedAt?: Date | string | null
  startedAt?: Date | string
  completedAt?: Date | string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type MongoTrackerTopicRecord = {
  _id: MongoIdLike
  trackerId: MongoIdLike
  title: string
  description?: string
  order: number
  status?: string
  estimatedHours?: number
  progressPercent?: number
  deletedAt?: Date | string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type MongoTrackerSubtopicRecord = {
  _id: MongoIdLike
  trackerId: MongoIdLike
  topicId: MongoIdLike
  parentSubtopicId?: MongoIdLike | null
  title: string
  description?: string
  order: number
  depth: number
  isLocked?: boolean
  estimatedMinutes?: number
  deletedAt?: Date | string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type MongoCommunitySubmissionRecord = {
  _id: MongoIdLike
  trackerId: MongoIdLike
  ownerId: MongoIdLike
  title: string
  category?: string
  excerpt?: string
  progress?: number
  passVotes?: number
  failVotes?: number
  requiredVotes?: number
  status?: VerificationSubmissionStatus
  urgent?: boolean
  consensusChoice?: VerificationVoteChoice | null
  expiresAt?: Date | string | null
  deletedAt?: Date | string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  [key: string]: unknown
}

export type MongoCommunityVoteRecord = {
  _id: MongoIdLike
  submissionId: MongoIdLike
  userId: MongoIdLike
  choice?: VerificationVoteChoice
  reason?: string | null
  rewardCoins?: number
  createdAt?: Date | string
  updatedAt?: Date | string
  [key: string]: unknown
}

export type MongoCommunityLeaderboardAggregate = {
  _id: MongoIdLike
  totalEarned: number
  reviewed: number
}

export type MongoUserProfileRecord = {
  _id?: MongoIdLike
  userId?: MongoIdLike
  fullName?: string
  headline?: string
  avatarUrl?: string | null
  publishedCount?: number
  cloneCount?: number
  ratingAverage?: number
  likeCount?: number
  deletedAt?: Date | string | null
  [key: string]: unknown
}

export type MongoUserRecord = {
  _id: MongoIdLike
  fullName?: string
  username?: string
  avatarUrl?: string | null
  coins?: number
  xp?: number
  level?: number
  streakCount?: number
  isPremium?: boolean
  deletedAt?: Date | string | null
  [key: string]: unknown
}
