// apps/api/src/modules/community/infrastructure/repositories/mongo-community.mapper.ts

import { CommunityPublicTrackerDetailEntity } from '../../../domain/entities/community-public-tracker-detail.entity'
import type {
  CommunityRatingSummaryEntity,
  CommunityPublicTrackerTopicEntity,
} from '../../../domain/entities/community-public-tracker-detail.entity'
import { CommunityTrackerReviewEntity } from '../../../domain/entities/community-tracker-review.entity'
import { CommunityLeaderboardEntryEntity } from '../../../domain/entities/community-leaderboard-entry.entity'
import { CommunityMemberStatsEntity } from '../../../domain/entities/community-member-stats.entity'
import { CommunityReviewVoteEntity } from '../../../domain/entities/community-review-vote.entity'
import { CommunityTrackerEntity } from '../../../domain/entities/community-tracker.entity'
import {
  CommunityVerificationSubmissionEntity,
  type CommunityVerificationReviewSubtopic,
  type CommunityVerificationReviewTopic,
  type CommunityVerificationReviewTracker,
} from '../../../domain/entities/community-verification-submission.entity'
import type {
  VerificationSubmissionStatus,
  VerificationVoteChoice,
} from '../../../domain/community.types'
import type {
  MongoAuthorLookup,
  MongoCommunitySubmissionRecord,
  MongoCommunityTrackerRecord,
  MongoCommunityTrackerReviewRecord,
  MongoCommunityVoteRecord,
  MongoIdLike,
  MongoTrackerSubtopicRecord,
  MongoTrackerTopicRecord,
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

  toPublicTrackerDetailEntity(input: {
    tracker: MongoCommunityTrackerRecord
    userId: string
    clone?: MongoCommunityTrackerRecord | null
    liked: unknown
    topics: MongoTrackerTopicRecord[]
    subtopics: MongoTrackerSubtopicRecord[]
    ratingSummary: CommunityRatingSummaryEntity
    reviews: CommunityTrackerReviewEntity[]
    myReview: CommunityTrackerReviewEntity | null
    author: MongoAuthorLookup
  }): CommunityPublicTrackerDetailEntity {
    const {
      tracker,
      userId,
      clone,
      liked,
      topics,
      subtopics,
      ratingSummary,
      reviews,
      myReview,
      author,
    } = input

    return new CommunityPublicTrackerDetailEntity({
      id: this.toId(tracker._id),
      ownerId: this.toId(tracker.ownerId),
      title: this.toString(tracker.title, 'Untitled tracker'),
      description: this.toString(tracker.description, ''),
      category: this.toString(tracker.category, 'general'),
      field: this.toString(tracker.field, ''),
      goal: this.toString(tracker.goal, ''),
      level: this.toString(tracker.level, 'beginner'),
      tags: Array.isArray(tracker.tags) ? tracker.tags : [],
      verified: tracker.verificationStatus === 'verified',
      visibility: this.toString(tracker.visibility, 'public'),
      status: this.toString(tracker.status, 'active'),
      allowClone: Boolean(tracker.allowClone),
      inDashboard: tracker.ownerId.toString() === userId || Boolean(clone?._id),
      clones: this.toNumber(tracker.cloneCount, 0),
      likes: this.toNumber(tracker.likeCount, 0),
      likedByMe: Boolean(liked),
      saves: this.toNumber(tracker.saveCount, 0),
      topicsCount: this.toNumber(tracker.topicsCount, topics.length),
      subtopicsCount: this.toNumber(tracker.subtopicsCount, subtopics.length),
      author: {
        id: this.toId(tracker.ownerId),
        name: author.name,
        initials: author.initials,
        avatarUrl: author.avatarUrl ?? null,
        role: 'Community mentor',
      },
      topics: this.toPublicTrackerTopics(topics, subtopics),
      ratingSummary,
      reviews,
      myReview,
      createdAt: this.toDate(tracker.createdAt),
      publishedAt: this.toDateOrNull(tracker.publishedAt),
    })
  }

  toReviewEntity(
    review: MongoCommunityTrackerReviewRecord | null | undefined,
    currentUserId: string,
    authors?: Map<string, MongoAuthorLookup>,
  ): CommunityTrackerReviewEntity | null {
    if (!review?._id) {
      return null
    }

    const userId = String(review.userId)
    const author = authors?.get(userId)
    const authorName = this.toString(
      author?.name ?? review.authorName,
      `Scholar ${userId.slice(-4)}`,
    )
    const helpfulUserIds = this.toHelpfulUserIdStrings(review.helpfulUserIds)

    return new CommunityTrackerReviewEntity({
      id: this.toId(review._id),
      trackerId: this.toId(review.trackerId),
      userId,
      authorName,
      authorInitials: author?.initials ?? this.getInitials(authorName),
      authorAvatarUrl: author?.avatarUrl ?? null,
      rating: Math.min(Math.max(this.toNumber(review.rating, 1), 1), 5),
      comment: this.toString(review.comment, ''),
      helpfulCount: Math.max(this.toNumber(review.helpfulCount, 0), 0),
      helpfulByMe: helpfulUserIds.has(currentUserId),
      isMine: userId === currentUserId,
      createdAt: this.toDate(review.createdAt),
      updatedAt: this.toDate(review.updatedAt),
    })
  }

  toAuthorLookup(input: {
    id: MongoIdLike
    profile?: MongoUserProfileRecord | null
    user?: MongoUserRecord | null
    fallbackName: string
  }): MongoAuthorLookup {
    const id = this.toId(input.id)
    const name = this.toString(
      input.profile?.fullName ?? input.user?.fullName ?? input.user?.username,
      input.fallbackName,
    )

    return {
      id,
      name,
      initials: this.getInitials(name),
      avatarUrl: input.profile?.avatarUrl ?? input.user?.avatarUrl ?? null,
    }
  }

  toHelpfulUserIdStrings(value: unknown): Set<string> {
    if (!Array.isArray(value)) {
      return new Set()
    }

    return new Set(value.map((item) => String(item)))
  }

  private toPublicTrackerTopics(
    topics: MongoTrackerTopicRecord[],
    subtopics: MongoTrackerSubtopicRecord[],
  ): CommunityPublicTrackerTopicEntity[] {
    const subtopicsByTopicId = new Map<string, MongoTrackerSubtopicRecord[]>()

    for (const subtopic of subtopics) {
      const topicId = String(subtopic.topicId)
      const items = subtopicsByTopicId.get(topicId) ?? []

      items.push(subtopic)
      subtopicsByTopicId.set(topicId, items)
    }

    return topics.map((topic) => ({
      id: this.toId(topic._id),
      title: this.toString(topic.title, 'Untitled topic'),
      description: this.toString(topic.description, ''),
      order: this.toNumber(topic.order, 0),
      status: this.toString(topic.status, 'active'),
      estimatedHours: this.toNumber(topic.estimatedHours, 0),
      subtopics: (subtopicsByTopicId.get(String(topic._id)) ?? []).map(
        (subtopic) => ({
          id: this.toId(subtopic._id),
          topicId: this.toId(subtopic.topicId),
          parentSubtopicId: subtopic.parentSubtopicId
            ? this.toId(subtopic.parentSubtopicId)
            : null,
          title: this.toString(subtopic.title, 'Untitled subtopic'),
          description: this.toString(subtopic.description, ''),
          order: this.toNumber(subtopic.order, 0),
          depth: this.toNumber(subtopic.depth, 0),
          isLocked: Boolean(subtopic.isLocked),
          estimatedMinutes: this.toNumber(subtopic.estimatedMinutes, 0),
        }),
      ),
    }))
  }

  private getInitials(value: string): string {
    const initials = value
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return initials || 'IM'
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

  private toReviewSubtopic(
    value: unknown,
  ): CommunityVerificationReviewSubtopic {
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
