import { CommunityPublicTrackerDetailEntity } from '../../domain/entities/community-public-tracker-detail.entity'
import { CommunityTrackerReviewEntity } from '../../domain/entities/community-tracker-review.entity'
import type {
  CommunityRatingDistributionEntity,
  CommunityRatingSummaryEntity,
  CommunityPublicTrackerTopicEntity,
} from '../../domain/entities/community-public-tracker-detail.entity'
import type {
  CommunityReviewRepositoryContract,
  UpsertCommunityTrackerReviewInput,
} from '../../domain/repositories/community-review.repository.interface'
import { MongoCommunityBaseRepository } from './mongo-community-base.repository'
import {
  CommunityTrackerLikeModel,
  CommunityTrackerModel,
  CommunityTrackerReviewModel,
  CommunityTrackerSubtopicModel,
  CommunityTrackerTopicModel,
  CommunityUserModel,
  CommunityUserProfileModel,
} from './mongo-community.models'
import type {
  MongoCommunityTrackerRecord,
  MongoIdLike,
  MongoTrackerSubtopicRecord,
  MongoTrackerTopicRecord,
  MongoUserProfileRecord,
  MongoUserRecord,
} from './mongo-community.types'
import type {
  MongoAuthorLookup,
  MongoCommunityTrackerReviewRecord,
  MongoRatingAggregate,
} from './mongo-community-review.types'

type MongoCommunityTrackerLikeRecord = {
  _id: MongoIdLike
  trackerId: MongoIdLike
  userId: MongoIdLike
  deletedAt?: Date | null
}

export class MongoCommunityReviewRepository
  extends MongoCommunityBaseRepository
  implements CommunityReviewRepositoryContract
{
  async findPublicTrackerDetail(trackerId: string, userId: string) {
    return this.execute(
      'COMMUNITY_PUBLIC_TRACKER_DETAIL_READ_FAILED',
      'Failed to read public tracker detail',
      async () => {
        if (!this.isValidObjectId(trackerId) || !this.isValidObjectId(userId)) {
          return null
        }

        const trackerObjectId = this.toObjectId(trackerId)
        const userObjectId = this.toObjectId(userId)

        const tracker = await CommunityTrackerModel.findOne({
          _id: trackerObjectId,
          deletedAt: null,
          status: { $ne: 'archived' },
          $or: [{ visibility: 'public' }, { publishedAt: { $ne: null } }],
        }).lean<MongoCommunityTrackerRecord>()

        if (!tracker) {
          return null
        }

        const [
          topics,
          subtopics,
          ratingSummary,
          reviews,
          myReview,
          author,
          clone,
          liked,
        ] = await Promise.all([
          this.findTopics(trackerObjectId),
          this.findSubtopics(trackerObjectId),
          this.getRatingSummary(trackerObjectId),
          this.findReviews(trackerObjectId, userObjectId, 20),
          this.findMyReview(trackerObjectId, userObjectId),
          this.findAuthor(tracker.ownerId),
          CommunityTrackerModel.findOne({
            ownerId: userObjectId,
            sourceTrackerId: trackerObjectId,
            deletedAt: null,
          }).lean<MongoCommunityTrackerRecord>(),
          CommunityTrackerLikeModel.exists({
            trackerId: trackerObjectId,
            userId: userObjectId,
            deletedAt: null,
          }),
        ])

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
          inDashboard:
            tracker.ownerId.toString() === userId || Boolean(clone?._id),
          clones: this.toNumber(tracker.cloneCount, 0),
          likes: this.toNumber(tracker.likeCount, 0),
          likedByMe: Boolean(liked),
          saves: this.toNumber(tracker.saveCount, 0),
          topicsCount: this.toNumber(tracker.topicsCount, topics.length),
          subtopicsCount: this.toNumber(
            tracker.subtopicsCount,
            subtopics.length,
          ),
          author: {
            id: this.toId(tracker.ownerId),
            name: author.name,
            initials: author.initials,
            avatarUrl: author.avatarUrl ?? null,
            role: 'Community mentor',
          },
          topics: this.mapTopicsWithSubtopics(topics, subtopics),
          ratingSummary,
          reviews,
          myReview,
          createdAt: this.toDate(tracker.createdAt),
          publishedAt: this.toDateOrNull(tracker.publishedAt),
        })
      },
    )
  }

  async upsertTrackerReview(input: UpsertCommunityTrackerReviewInput) {
    return this.execute(
      'COMMUNITY_REVIEW_SAVE_FAILED',
      'Failed to save tracker review',
      async () => {
        if (
          !this.isValidObjectId(input.trackerId) ||
          !this.isValidObjectId(input.userId)
        ) {
          return null
        }

        const trackerObjectId = this.toObjectId(input.trackerId)
        const userObjectId = this.toObjectId(input.userId)

        const tracker = await CommunityTrackerModel.findOne({
          _id: trackerObjectId,
          deletedAt: null,
          status: { $ne: 'archived' },
          $or: [{ visibility: 'public' }, { publishedAt: { $ne: null } }],
        }).lean<MongoCommunityTrackerRecord>()

        if (!tracker) {
          return null
        }

        const review = await CommunityTrackerReviewModel.findOneAndUpdate(
          {
            trackerId: trackerObjectId,
            userId: userObjectId,
            deletedAt: null,
          },
          {
            $set: {
              rating: input.rating,
              comment: input.comment,
            },
            $setOnInsert: {
              trackerId: trackerObjectId,
              userId: userObjectId,
              helpfulUserIds: [],
              helpfulCount: 0,
              deletedAt: null,
            },
          },
          {
            upsert: true,
            new: true,
          },
        ).lean<MongoCommunityTrackerReviewRecord>()

        await this.syncTrackerRatingStats(trackerObjectId)

        const author = await this.findAuthor(userObjectId)

        return this.toReviewEntity(
          review,
          input.userId,
          new Map([[input.userId, author]]),
        )
      },
    )
  }

  async toggleReviewHelpful(reviewId: string, userId: string) {
    return this.execute(
      'COMMUNITY_REVIEW_HELPFUL_TOGGLE_FAILED',
      'Failed to update review helpful state',
      async () => {
        if (!this.isValidObjectId(reviewId) || !this.isValidObjectId(userId)) {
          return null
        }

        const reviewObjectId = this.toObjectId(reviewId)
        const userObjectId = this.toObjectId(userId)

        const review = await CommunityTrackerReviewModel.findOne({
          _id: reviewObjectId,
          deletedAt: null,
        }).lean<MongoCommunityTrackerReviewRecord>()

        if (!review) {
          return null
        }

        const helpfulUserIds = this.toHelpfulUserIdStrings(review.helpfulUserIds)
        const hasHelpful = helpfulUserIds.has(userId)

        const updatedReview = await CommunityTrackerReviewModel.findOneAndUpdate(
          {
            _id: reviewObjectId,
            deletedAt: null,
          },
          hasHelpful
            ? {
                $pull: { helpfulUserIds: userObjectId },
                $inc: { helpfulCount: -1 },
              }
            : {
                $addToSet: { helpfulUserIds: userObjectId },
                $inc: { helpfulCount: 1 },
              },
          {
            new: true,
          },
        ).lean<MongoCommunityTrackerReviewRecord>()

        if (!updatedReview) {
          return null
        }

        const authors = await this.findAuthors([String(updatedReview.userId)])

        return this.toReviewEntity(updatedReview, userId, authors)
      },
    )
  }

  async toggleTrackerLike(trackerId: string, userId: string) {
    return this.execute(
      'COMMUNITY_TRACKER_LIKE_TOGGLE_FAILED',
      'Failed to update tracker like state',
      async () => {
        if (!this.isValidObjectId(trackerId) || !this.isValidObjectId(userId)) {
          return null
        }

        const trackerObjectId = this.toObjectId(trackerId)
        const userObjectId = this.toObjectId(userId)

        const tracker = await CommunityTrackerModel.findOne({
          _id: trackerObjectId,
          deletedAt: null,
          status: { $ne: 'archived' },
          $or: [{ visibility: 'public' }, { publishedAt: { $ne: null } }],
        }).lean<MongoCommunityTrackerRecord>()

        if (!tracker) {
          return null
        }

        const existingLike = await CommunityTrackerLikeModel.findOne({
          trackerId: trackerObjectId,
          userId: userObjectId,
          deletedAt: null,
        }).lean<MongoCommunityTrackerLikeRecord>()

        const liked = !existingLike

        if (existingLike) {
          await CommunityTrackerLikeModel.updateOne(
            {
              _id: existingLike._id,
            },
            {
              $set: {
                deletedAt: new Date(),
              },
            },
          )
        } else {
          await CommunityTrackerLikeModel.create({
            trackerId: trackerObjectId,
            userId: userObjectId,
            deletedAt: null,
          })
        }

        const likes = await CommunityTrackerLikeModel.countDocuments({
          trackerId: trackerObjectId,
          deletedAt: null,
        })

        await CommunityTrackerModel.updateOne(
          {
            _id: trackerObjectId,
            deletedAt: null,
          },
          {
            $set: {
              likeCount: likes,
            },
          },
        )

        return {
          liked,
          likes,
        }
      },
    )
  }

  private async findTopics(trackerId: MongoIdLike) {
    return (await CommunityTrackerTopicModel.find({
      trackerId: this.toExistingObjectId(trackerId),
      deletedAt: null,
    })
      .sort({ order: 1 })
      .lean<MongoTrackerTopicRecord[]>()) as MongoTrackerTopicRecord[]
  }

  private async findSubtopics(trackerId: MongoIdLike) {
    return (await CommunityTrackerSubtopicModel.find({
      trackerId: this.toExistingObjectId(trackerId),
      deletedAt: null,
    })
      .sort({ depth: 1, order: 1 })
      .lean<MongoTrackerSubtopicRecord[]>()) as MongoTrackerSubtopicRecord[]
  }

  private async findReviews(
    trackerId: MongoIdLike,
    userId: MongoIdLike,
    limit: number,
  ) {
    const reviews = (await CommunityTrackerReviewModel.find({
      trackerId: this.toExistingObjectId(trackerId),
      deletedAt: null,
    })
      .sort({ helpfulCount: -1, createdAt: -1 })
      .limit(limit)
      .lean<MongoCommunityTrackerReviewRecord[]>()) as MongoCommunityTrackerReviewRecord[]

    return this.toReviewEntities(reviews, userId.toString())
  }

  private async findMyReview(trackerId: MongoIdLike, userId: MongoIdLike) {
    const review = await CommunityTrackerReviewModel.findOne({
      trackerId: this.toExistingObjectId(trackerId),
      userId: this.toExistingObjectId(userId),
      deletedAt: null,
    }).lean<MongoCommunityTrackerReviewRecord>()

    const authors = review
      ? await this.findAuthors([String(review.userId)])
      : undefined

    return this.toReviewEntity(review, userId.toString(), authors)
  }

  private async getRatingSummary(
    trackerId: MongoIdLike,
  ): Promise<CommunityRatingSummaryEntity> {
    const rows = (await CommunityTrackerReviewModel.aggregate<MongoRatingAggregate>([
      {
        $match: {
          trackerId: this.toExistingObjectId(trackerId),
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ])) as MongoRatingAggregate[]

    const distribution: CommunityRatingDistributionEntity = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    let total = 0
    let weightedTotal = 0

    for (const row of rows) {
      const rating = Math.min(
        Math.max(Number(row._id), 1),
        5,
      ) as 1 | 2 | 3 | 4 | 5
      const count = Number(row.count ?? 0)

      distribution[rating] = count
      total += count
      weightedTotal += rating * count
    }

    return {
      average: total > 0 ? weightedTotal / total : 0,
      count: total,
      distribution,
    }
  }

  private async syncTrackerRatingStats(trackerId: MongoIdLike): Promise<void> {
    const summary = await this.getRatingSummary(trackerId)

    await CommunityTrackerModel.updateOne(
      {
        _id: this.toExistingObjectId(trackerId),
        deletedAt: null,
      },
      {
        $set: {
          ratingAverage: Number(summary.average.toFixed(2)),
          ratingCount: summary.count,
        },
      },
    )
  }

  private mapTopicsWithSubtopics(
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

  private async toReviewEntities(
    reviews: MongoCommunityTrackerReviewRecord[],
    currentUserId: string,
  ): Promise<CommunityTrackerReviewEntity[]> {
    const userIds = [...new Set(reviews.map((review) => String(review.userId)))]
    const authors = await this.findAuthors(userIds)

    return reviews
      .map((review) => this.toReviewEntity(review, currentUserId, authors))
      .filter((review): review is CommunityTrackerReviewEntity => Boolean(review))
  }

  private toReviewEntity(
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

  private async findAuthor(ownerId: MongoIdLike): Promise<MongoAuthorLookup> {
    const [profile, user] = (await Promise.all([
      CommunityUserProfileModel.findOne({
        userId: this.toExistingObjectId(ownerId),
        deletedAt: null,
      }).lean<MongoUserProfileRecord>(),
      CommunityUserModel.findById(
        this.toExistingObjectId(ownerId),
      ).lean<MongoUserRecord>(),
    ])) as [MongoUserProfileRecord | null, MongoUserRecord | null]

    const name = this.toString(
      profile?.fullName ?? user?.fullName ?? user?.username,
      'Community mentor',
    )

    return {
      id: this.toId(ownerId),
      name,
      initials: this.getInitials(name),
      avatarUrl: profile?.avatarUrl ?? user?.avatarUrl ?? null,
    }
  }

  private async findAuthors(
    userIds: string[],
  ): Promise<Map<string, MongoAuthorLookup>> {
    if (!userIds.length) {
      return new Map()
    }

    const objectIds = userIds.map((userId) => this.toObjectId(userId))

    const [profiles, users] = (await Promise.all([
      CommunityUserProfileModel.find({
        userId: { $in: objectIds },
        deletedAt: null,
      }).lean<MongoUserProfileRecord[]>(),
      CommunityUserModel.find({
        _id: { $in: objectIds },
        deletedAt: null,
      }).lean<MongoUserRecord[]>(),
    ])) as [MongoUserProfileRecord[], MongoUserRecord[]]

    const profileByUserId = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    )
    const userById = new Map(users.map((user) => [String(user._id), user]))

    return new Map(
      userIds.map((userId) => {
        const profile = profileByUserId.get(userId)
        const user = userById.get(userId)
        const name = this.toString(
          profile?.fullName ?? user?.fullName ?? user?.username,
          `Scholar ${userId.slice(-4)}`,
        )

        return [
          userId,
          {
            id: userId,
            name,
            initials: this.getInitials(name),
            avatarUrl: profile?.avatarUrl ?? user?.avatarUrl ?? null,
          },
        ]
      }),
    )
  }

  private toHelpfulUserIdStrings(value: unknown): Set<string> {
    if (!Array.isArray(value)) {
      return new Set()
    }

    return new Set(value.map((item) => String(item)))
  }

  private toId(value: MongoIdLike | null | undefined): string {
    return value ? value.toString() : ''
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

    return Number.isFinite(numeric) ? numeric : fallback
  }

  private toString(value: unknown, fallback: string): string {
    if (typeof value !== 'string') {
      return fallback
    }

    const trimmed = value.trim()

    return trimmed || fallback
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
}

export const mongoCommunityReviewRepository =
  new MongoCommunityReviewRepository()