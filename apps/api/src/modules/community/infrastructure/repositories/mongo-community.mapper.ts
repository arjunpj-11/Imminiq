// apps/api/src/modules/community/infrastructure/repositories/mongo-community.mapper.ts

import { CommunityLeaderboardEntryEntity } from '../../domain/entities/community-leaderboard-entry.entity'
import { CommunityMemberStatsEntity } from '../../domain/entities/community-member-stats.entity'
import { CommunityReviewVoteEntity } from '../../domain/entities/community-review-vote.entity'
import { CommunityTrackerEntity } from '../../domain/entities/community-tracker.entity'
import {
  CommunityVerificationSubmissionEntity,
  type CommunityVerificationReviewSubtopic,
  type CommunityVerificationReviewTopic,
  type CommunityVerificationReviewTracker,
} from '../../domain/entities/community-verification-submission.entity'
import type { VerificationSubmissionStatus } from '../../domain/value-objects/verification-submission-status.vo'
import type { VerificationVoteChoice } from '../../domain/value-objects/verification-vote-choice.vo'
import type {
  MongoCommunitySubmissionRecord,
  MongoCommunityTrackerRecord,
  MongoCommunityVoteRecord,
  MongoIdLike,
  MongoUserProfileRecord,
  MongoUserRecord,
} from './mongo-community.types'

export class MongoCommunityMapper {
  toTrackerEntity(
    record: MongoCommunityTrackerRecord | null | undefined,
    userId?: string,
  ): CommunityTrackerEntity | null {
    if (!record?._id) {
      return null
    }

    const ownerId = this.toId(record.ownerId)

    return new CommunityTrackerEntity({
      id: this.toId(record._id),
      ownerId,
      title: this.toString(record.title, 'Untitled tracker'),
      description: this.toString(record.description, ''),
      rating: this.toNumber(record.ratingAverage, 0),
      clones: this.toNumber(record.cloneCount, 0),
      verified: record.verificationStatus === 'verified',
      inDashboard: Boolean(record.inDashboard) || ownerId === userId,
      topic: this.toString(record.category ?? record.field, 'General'),
      createdAt: this.toDate(record.createdAt),
    })
  }

  toSubmissionEntity(
    record: MongoCommunitySubmissionRecord | null | undefined,
    userVote?: VerificationVoteChoice | null,
  ): CommunityVerificationSubmissionEntity | null {
    if (!record?._id) {
      return null
    }

    const passVotes = this.toNumber(record.passVotes, 0)
    const failVotes = this.toNumber(record.failVotes, 0)
    const requiredVotes = Math.max(this.toNumber(record.requiredVotes, 10), 1)
    const totalVotes = passVotes + failVotes
    const progress =
      record.progress ??
      Math.min(Math.round((totalVotes / requiredVotes) * 100), 100)

    return new CommunityVerificationSubmissionEntity({
      id: this.toId(record._id),
      trackerId: this.toId(record.trackerId),
      ownerId: this.toId(record.ownerId),
      title: this.toString(record.title, 'Untitled submission'),
      category: this.toString(record.category, 'General'),
      excerpt: this.toString(record.excerpt, ''),
      progress: this.toNumber(progress, 0),
      passVotes,
      failVotes,
      requiredVotes,
      status: this.toSubmissionStatus(record.status),
      urgent: Boolean(record.urgent),
      userVote: this.toVoteChoice(userVote),
      consensusChoice: this.toVoteChoice(record.consensusChoice),
      expiresAt: this.toDateOrNull(record.expiresAt),
      createdAt: this.toDate(record.createdAt),
      reviewTracker: this.toReviewTracker(record.reviewTracker),
    })
  }

  toVoteEntity(
    record: MongoCommunityVoteRecord | null | undefined,
  ): CommunityReviewVoteEntity | null {
    if (!record?._id) {
      return null
    }

    return new CommunityReviewVoteEntity({
      id: this.toId(record._id),
      submissionId: this.toId(record.submissionId),
      userId: this.toId(record.userId),
      choice: this.toVoteChoice(record.choice) ?? 'pass',
      reason: record.reason ?? null,
      rewardCoins: this.toNumber(record.rewardCoins, 0),
      createdAt: this.toDate(record.createdAt),
    })
  }

  toStatsEntity(input: {
    publishedCount: number
    clonesReceived: number
    clonedByUser: number
    averageRating: number
  }): CommunityMemberStatsEntity {
    return new CommunityMemberStatsEntity(input)
  }

  toLeaderboardEntryEntity(input: {
    userId: string
    rank: number
    profile?: MongoUserProfileRecord | null
    user?: MongoUserRecord | null
    earnedCoins: number
    isCurrentUser: boolean
  }): CommunityLeaderboardEntryEntity {
    return new CommunityLeaderboardEntryEntity({
      userId: input.userId,
      rank: input.rank,
      name: this.toString(
        input.profile?.fullName ?? input.user?.fullName ?? input.user?.username,
        `Scholar ${input.rank}`,
      ),
      earnedCoins: input.earnedCoins,
      badge: this.badgeForRank(input.rank),
      isCurrentUser: input.isCurrentUser,
    })
  }

  toPlainRecord<T>(document: { toObject?: () => T } | T | null): T | null {
    if (!document) {
      return null
    }

    if (
      typeof document === 'object' &&
      'toObject' in document &&
      document.toObject
    ) {
      return document.toObject()
    }

    return document as T
  }

  private toReviewTracker(
    value: unknown,
  ): CommunityVerificationReviewTracker | null {
    if (!value || typeof value !== 'object') {
      return null
    }

    const record = value as Record<string, unknown>

    return {
      id: this.toString(record.id, ''),
      title: this.toString(record.title, 'Untitled tracker'),
      description: this.toString(record.description, ''),
      category: this.toString(record.category, 'General'),
      field: this.toString(record.field, ''),
      goal: this.toString(record.goal, ''),
      level: this.toString(record.level, 'beginner'),
      tags: this.toStringArray(record.tags),
      visibility: this.toString(record.visibility, 'private'),
      status: this.toString(record.status, 'active'),
      topicsCount: this.toNumber(record.topicsCount, 0),
      subtopicsCount: this.toNumber(record.subtopicsCount, 0),
      topics: this.toReviewTopics(record.topics),
    }
  }

  private toReviewTopics(value: unknown): CommunityVerificationReviewTopic[] {
    if (!Array.isArray(value)) {
      return []
    }

    return value.map((item) => this.toReviewTopic(item))
  }

  private toReviewTopic(value: unknown): CommunityVerificationReviewTopic {
    const record =
      value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {}

    return {
      id: this.toString(record.id, ''),
      title: this.toString(record.title, 'Untitled topic'),
      description: this.toString(record.description, ''),
      order: this.toNumber(record.order, 0),
      status: this.toString(record.status, 'active'),
      estimatedHours: this.toNumber(record.estimatedHours, 0),
      subtopics: this.toReviewSubtopics(record.subtopics),
    }
  }

  private toReviewSubtopics(
    value: unknown,
  ): CommunityVerificationReviewSubtopic[] {
    if (!Array.isArray(value)) {
      return []
    }

    return value.map((item) => this.toReviewSubtopic(item))
  }

  private toReviewSubtopic(value: unknown): CommunityVerificationReviewSubtopic {
    const record =
      value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {}

    return {
      id: this.toString(record.id, ''),
      topicId: this.toString(record.topicId, ''),
      parentSubtopicId:
        typeof record.parentSubtopicId === 'string'
          ? record.parentSubtopicId
          : null,
      title: this.toString(record.title, 'Untitled subtopic'),
      description: this.toString(record.description, ''),
      order: this.toNumber(record.order, 0),
      depth: this.toNumber(record.depth, 0),
      isLocked: Boolean(record.isLocked),
      estimatedMinutes: this.toNumber(record.estimatedMinutes, 0),
    }
  }

  private badgeForRank(rank: number): string {
    if (rank === 1) {
      return '🥇'
    }

    if (rank === 2) {
      return '🥈'
    }

    if (rank === 3) {
      return '🥉'
    }

    return '🏅'
  }

  private toSubmissionStatus(value: unknown): VerificationSubmissionStatus {
    if (
      value === 'closed' ||
      value === 'approved' ||
      value === 'rejected' ||
      value === 'expired'
    ) {
      return value
    }

    return 'open'
  }

  private toVoteChoice(value: unknown): VerificationVoteChoice | null {
    if (value === 'pass' || value === 'fail') {
      return value
    }

    return null
  }

  private toDate(value: unknown): Date | undefined {
    const date = this.toDateOrNull(value)

    return date ?? undefined
  }

  private toDateOrNull(value: unknown): Date | null {
    if (!value) {
      return null
    }

    const date = value instanceof Date ? value : new Date(String(value))

    if (Number.isNaN(date.getTime())) {
      return null
    }

    return date
  }

  private toNumber(value: unknown, fallback: number): number {
    const numeric = Number(value)

    if (!Number.isFinite(numeric)) {
      return fallback
    }

    return numeric
  }

  private toString(value: unknown, fallback: string): string {
    if (typeof value !== 'string') {
      return fallback
    }

    const trimmed = value.trim()

    return trimmed || fallback
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return []
    }

    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  private toId(value: MongoIdLike | null | undefined): string {
    if (!value) {
      return ''
    }

    return value.toString()
  }
}