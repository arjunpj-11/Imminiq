import type { LeaderboardSection } from '../../../domain/value-objects/leaderboard-section.vo'

export type MongoIdLike = {
  toString(): string
}

export type MongoRankedUserRecord = {
  _id: MongoIdLike
  rank: number
  fullName: string
  username: string
  avatarUrl?: string | null
  score: number
  totalScore: number
  level: number
  streakCount: number
  createdAt: Date
}

export type MongoLeaderboardFacetRecord = {
  topEntries: MongoRankedUserRecord[]
  viewerEntries: MongoRankedUserRecord[]
  targetEntries: MongoRankedUserRecord[]
  metadata: Array<{
    count: number
  }>
}

export type MongoSnapshotRankRecord = {
  userId: MongoIdLike
  rank: number
  score: number
  level: number
  streakCount: number
}

export type MongoSnapshotCaptureRecord = {
  _id: MongoIdLike
  rank: number
  score: number
  level: number
  streakCount: number
}

export type MongoLeaderboardXpEventRecord = {
  _id: MongoIdLike
  userId: MongoIdLike
  section: LeaderboardSection
  amount: number
  source: string
  idempotencyKey: string
  sourceEntityId?: string
  occurredAt: Date
}

export type MongoDuplicateKeyError = {
  code: 11000
  keyPattern?: Record<string, unknown>
  keyValue?: Record<string, unknown>
}
