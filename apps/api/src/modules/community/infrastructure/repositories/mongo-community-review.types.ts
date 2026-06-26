import type { MongoIdLike } from './mongo-community.types'

export type MongoCommunityTrackerReviewRecord = {
  _id: MongoIdLike
  trackerId: MongoIdLike
  userId: MongoIdLike
  rating?: number
  comment?: string
  helpfulUserIds?: MongoIdLike[]
  helpfulCount?: number
  deletedAt?: Date | string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  authorName?: string
  authorInitials?: string
  authorAvatarUrl?: string | null
  helpfulByMe?: boolean
  isMine?: boolean
  [key: string]: unknown
}

export type MongoRatingAggregate = {
  _id: number
  count: number
}

export type MongoAuthorLookup = {
  id: string
  name: string
  initials: string
  avatarUrl?: string | null
}
