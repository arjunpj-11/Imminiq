// apps/api/src/modules/community/infrastructure/repositories/mongo-community.repository.ts

import { COMMUNITY_REVIEW_REWARD_COINS } from '../../domain/constants/community.constants'
import { CommunityDomainError } from '../../domain/errors/community-domain.error'
import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type { FindCommunityTrackersQuery } from '../../domain/repositories/community-tracker.repository.interface'
import type {
  CreateCommunityReviewVoteInput,
  FindVerificationQueueQuery,
} from '../../domain/repositories/community-verification.repository.interface'
import type { VerificationVoteChoice } from '../../domain/value-objects/verification-vote-choice.vo'
import { MongoCommunityBaseRepository } from './mongo-community-base.repository'
import { MongoCommunityErrorMapper } from './mongo-community-error.mapper'
import { MongoCommunityMapper } from './mongo-community.mapper'
import {
  CommunityReviewVoteModel,
  CommunityTrackerModel,
  CommunityTrackerProgressModel,
  CommunityTrackerSubtopicModel,
  CommunityTrackerTopicModel,
  CommunityUserModel,
  CommunityUserProfileModel,
  CommunityVerificationSubmissionModel,
} from './mongo-community.models'
import type {
  MongoCommunityLeaderboardAggregate,
  MongoCommunitySubmissionRecord,
  MongoCommunityTrackerRecord,
  MongoCommunityVoteRecord,
  MongoIdLike,
  MongoTrackerProgressRecord,
  MongoTrackerSubtopicRecord,
  MongoTrackerTopicRecord,
  MongoUserProfileRecord,
  MongoUserRecord,
} from './mongo-community.types'

type TrackerQuery = Record<string, unknown>
type SubmissionQuery = Record<string, unknown>

export class MongoCommunityRepository
  extends MongoCommunityBaseRepository
  implements CommunityRepositoryContract
{
  constructor(
    private readonly mapper = new MongoCommunityMapper(),
    private readonly errorMapper = new MongoCommunityErrorMapper(),
  ) {
    super()
  }

  async findPublicTrackers(query: FindCommunityTrackersQuery) {
    return this.execute(
      'COMMUNITY_TRACKERS_READ_FAILED',
      'Failed to read community trackers',
      async () => {
        const filters = this.buildPublicTrackerQuery(query)
        const sort = this.buildTrackerSort(query.sort)
        const skip = (query.page - 1) * query.limit

        const [items, total] = (await Promise.all([
          CommunityTrackerModel.find(filters)
            .sort(sort)
            .skip(skip)
            .limit(query.limit)
            .lean<MongoCommunityTrackerRecord[]>(),
          CommunityTrackerModel.countDocuments(filters),
        ])) as [MongoCommunityTrackerRecord[], number]

        const markedItems = await this.markDashboardTrackers(items, query.userId)
        const trackers = markedItems
          .map((item) => this.mapper.toTrackerEntity(item, query.userId))
          .filter((item): item is NonNullable<typeof item> => Boolean(item))

        return {
          items: trackers,
          total,
          page: query.page,
          limit: query.limit,
          totalPages: this.calculateTotalPages(total, query.limit),
        }
      },
    )
  }

  async findCommunityTrackerById(trackerId: string, userId: string) {
    return this.execute(
      'COMMUNITY_TRACKER_READ_FAILED',
      'Failed to read community tracker',
      async () => {
        if (!this.isValidObjectId(trackerId)) {
          return null
        }

        const tracker = await CommunityTrackerModel.findOne({
          _id: this.toObjectId(trackerId),
          ...this.publicTrackerVisibilityQuery(),
        }).lean<MongoCommunityTrackerRecord>()

        if (!tracker) {
          return null
        }

        const [markedTracker] = await this.markDashboardTrackers([tracker], userId)

        return this.mapper.toTrackerEntity(markedTracker, userId)
      },
    )
  }

  async cloneTrackerForUser(trackerId: string, userId: string) {
    return this.execute(
      'COMMUNITY_TRACKER_CLONE_FAILED',
      'Failed to clone community tracker',
      async () => {
        if (!this.isValidObjectId(trackerId) || !this.isValidObjectId(userId)) {
          return null
        }

        const trackerObjectId = this.toObjectId(trackerId)
        const userObjectId = this.toObjectId(userId)

        const source = await CommunityTrackerModel.findOne({
          _id: trackerObjectId,
          allowClone: true,
          ...this.publicTrackerVisibilityQuery(),
        }).lean<MongoCommunityTrackerRecord>()

        if (!source) {
          return null
        }

        if (source.ownerId.toString() === userId) {
          const owned = this.mapper.toTrackerEntity(
            { ...source, inDashboard: true },
            userId,
          )

          return owned ?? null
        }

        const existingClone = await CommunityTrackerModel.findOne({
          ownerId: userObjectId,
          sourceTrackerId: this.toExistingObjectId(source._id),
          deletedAt: null,
        }).lean<MongoCommunityTrackerRecord>()

        if (existingClone) {
          const existing = this.mapper.toTrackerEntity(
            { ...existingClone, inDashboard: true },
            userId,
          )

          return existing ?? null
        }

        const clone = await CommunityTrackerModel.create(
          this.prepareCloneData(source, userId),
        )
        const plainClone =
          this.mapper.toPlainRecord<MongoCommunityTrackerRecord>(clone)

        if (!plainClone) {
          throw new CommunityDomainError(
            'COMMUNITY_CLONE_MAPPING_FAILED',
            'Failed to map cloned tracker',
          )
        }

        await this.cloneTrackerContent(source._id, plainClone._id)
        await this.createInitialProgress(userId, plainClone)
        await CommunityTrackerModel.updateOne(
          { _id: source._id },
          { $inc: { cloneCount: 1 } },
        )

        const entity = this.mapper.toTrackerEntity(
          { ...plainClone, inDashboard: true },
          userId,
        )

        if (!entity) {
          throw new CommunityDomainError(
            'COMMUNITY_CLONE_MAPPING_FAILED',
            'Failed to map cloned tracker',
          )
        }

        return entity
      },
      (error) => this.errorMapper.mapDuplicateClone(error),
    )
  }

  async getPersonalStats(userId: string) {
    return this.execute(
      'COMMUNITY_STATS_READ_FAILED',
      'Failed to read community stats',
      async () => {
        const ownerId = this.toObjectId(userId)
        const publishedQuery = {
          ...this.publicTrackerVisibilityQuery(),
          ownerId,
        }
        const clonedQuery = {
          ownerId,
          sourceTrackerId: { $exists: true, $ne: null },
          deletedAt: null,
        }

        const [published, clonedByUser, profile] = (await Promise.all([
          CommunityTrackerModel.find(publishedQuery).lean<
            MongoCommunityTrackerRecord[]
          >(),
          CommunityTrackerModel.countDocuments(clonedQuery),
          CommunityUserProfileModel.findOne({
            userId: ownerId,
            deletedAt: null,
          }).lean<MongoUserProfileRecord>(),
        ])) as [
          MongoCommunityTrackerRecord[],
          number,
          MongoUserProfileRecord | null,
        ]

        const publishedCount =
          published.length || Number(profile?.publishedCount ?? 0)
        const clonesReceived =
          published.reduce(
            (total, tracker) => total + Number(tracker.cloneCount ?? 0),
            0,
          ) || Number(profile?.cloneCount ?? 0)
        const ratingTotal = published.reduce(
          (total, tracker) => total + Number(tracker.ratingAverage ?? 0),
          0,
        )
        const averageRating =
          published.length > 0
            ? ratingTotal / published.length
            : Number(profile?.ratingAverage ?? 0)

        return this.mapper.toStatsEntity({
          publishedCount,
          clonesReceived,
          clonedByUser,
          averageRating,
        })
      },
    )
  }

  async findAvailableTopics() {
    return this.execute(
      'COMMUNITY_TOPICS_READ_FAILED',
      'Failed to read community topics',
      async () => {
        const topics = (await CommunityTrackerModel.distinct('category', {
          ...this.publicTrackerVisibilityQuery(),
          category: { $exists: true, $ne: '' },
        })) as string[]

        return topics
          .map((topic) => this.normalizeTopic(String(topic)))
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
      },
    )
  }

  async getVerificationStats(userId: string) {
    return this.execute(
      'COMMUNITY_VERIFICATION_STATS_READ_FAILED',
      'Failed to read verification stats',
      async () => {
        const userObjectId = this.toObjectId(userId)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        const [awaiting, reviewed, rewardResult, user, activeReviewers] =
          await Promise.all([
            CommunityVerificationSubmissionModel.countDocuments(
              this.openSubmissionQuery(),
            ),
            CommunityReviewVoteModel.countDocuments({ userId: userObjectId }),
            CommunityReviewVoteModel.aggregate<{ total: number }>([
              { $match: { userId: userObjectId } },
              { $group: { _id: null, total: { $sum: '$rewardCoins' } } },
            ]),
            CommunityUserModel.findById(userObjectId).lean<MongoUserRecord>(),
            CommunityReviewVoteModel.distinct('userId', {
              createdAt: { $gte: weekAgo },
            }),
          ])

        return {
          awaiting,
          reviewed,
          totalEarnedCoins: rewardResult[0]?.total ?? 0,
          coinBalance: Number(user?.coins ?? 0),
          queueCount: awaiting,
          rewardCoins: COMMUNITY_REVIEW_REWARD_COINS,
          activeReviewersThisWeek: activeReviewers.length,
        }
      },
    )
  }

  async findVerificationQueue(query: FindVerificationQueueQuery) {
    return this.execute(
      'COMMUNITY_VERIFICATION_QUEUE_READ_FAILED',
      'Failed to read verification queue',
      async () => {
        const filters = this.openSubmissionQuery(query.userId)
        const skip = (query.page - 1) * query.limit

        const [submissions, total] = (await Promise.all([
          CommunityVerificationSubmissionModel.find(filters)
            .sort({ urgent: -1, expiresAt: 1, createdAt: -1 })
            .skip(skip)
            .limit(query.limit)
            .lean<MongoCommunitySubmissionRecord[]>(),
          CommunityVerificationSubmissionModel.countDocuments(filters),
        ])) as [MongoCommunitySubmissionRecord[], number]

        const submissionIds = submissions.map((submission) =>
          this.toExistingObjectId(submission._id),
        )
        const votes = (await CommunityReviewVoteModel.find({
          submissionId: { $in: submissionIds },
          userId: this.toObjectId(query.userId),
        }).lean<MongoCommunityVoteRecord[]>()) as MongoCommunityVoteRecord[]
        const voteBySubmission = new Map<
          string,
          VerificationVoteChoice | undefined
        >(votes.map((vote) => [String(vote.submissionId), vote.choice]))
        const items = submissions
          .map((submission) =>
            this.mapper.toSubmissionEntity(
              submission,
              voteBySubmission.get(String(submission._id)) ?? null,
            ),
          )
          .filter((item): item is NonNullable<typeof item> => Boolean(item))

        return {
          items,
          total,
          page: query.page,
          limit: query.limit,
          totalPages: this.calculateTotalPages(total, query.limit),
        }
      },
    )
  }

  async findVerificationSubmissionById(submissionId: string, userId: string) {
    return this.execute(
      'COMMUNITY_VERIFICATION_SUBMISSION_READ_FAILED',
      'Failed to read verification submission',
      async () => {
        if (!this.isValidObjectId(submissionId)) {
          return null
        }

        const submission = await CommunityVerificationSubmissionModel.findOne({
          _id: this.toObjectId(submissionId),
          deletedAt: null,
        }).lean<MongoCommunitySubmissionRecord>()

        if (!submission) {
          return null
        }

        const vote = await CommunityReviewVoteModel.findOne({
          submissionId: submission._id,
          userId: this.toObjectId(userId),
        }).lean<MongoCommunityVoteRecord>()

        return this.mapper.toSubmissionEntity(submission, vote?.choice ?? null)
      },
    )
  }

  async findVoteBySubmissionAndUser(submissionId: string, userId: string) {
    return this.execute(
      'COMMUNITY_VERIFICATION_VOTE_READ_FAILED',
      'Failed to read verification vote',
      async () => {
        if (!this.isValidObjectId(submissionId) || !this.isValidObjectId(userId)) {
          return null
        }

        const vote = await CommunityReviewVoteModel.findOne({
          submissionId: this.toObjectId(submissionId),
          userId: this.toObjectId(userId),
        }).lean<MongoCommunityVoteRecord>()

        return this.mapper.toVoteEntity(vote)
      },
    )
  }

  async createVerificationVote(data: CreateCommunityReviewVoteInput) {
    return this.execute(
      'COMMUNITY_VERIFICATION_VOTE_CREATE_FAILED',
      'Failed to create verification vote',
      async () => {
        const submissionId = this.toObjectId(data.submissionId)
        const userId = this.toObjectId(data.userId)
        const rewardCoins = data.rewardCoins ?? 0

        const vote = await CommunityReviewVoteModel.create({
          submissionId,
          userId,
          choice: data.choice,
          reason: data.reason ?? null,
          rewardCoins,
        })

        const update = {
          $inc: data.choice === 'pass' ? { passVotes: 1 } : { failVotes: 1 },
        }

        await CommunityVerificationSubmissionModel.updateOne(
          { _id: submissionId, status: 'open', deletedAt: null },
          update,
        )
        await this.closeSubmissionIfConsensusReached(data.submissionId)

        const plainVote = this.mapper.toPlainRecord<MongoCommunityVoteRecord>(vote)
        const voteEntity = this.mapper.toVoteEntity(plainVote)

        if (!voteEntity) {
          throw new CommunityDomainError(
            'COMMUNITY_VOTE_MAPPING_FAILED',
            'Failed to map review vote',
          )
        }

        return voteEntity
      },
      (error) => this.errorMapper.mapDuplicateVote(error),
    )
  }

  async findUnrewardedMajorityVotes(
    submissionId: string,
    choice: VerificationVoteChoice,
  ) {
    return this.execute(
      'COMMUNITY_REWARDABLE_VOTES_READ_FAILED',
      'Failed to read rewardable verification votes',
      async () => {
        if (!this.isValidObjectId(submissionId)) {
          return []
        }

        const votes = (await CommunityReviewVoteModel.find({
          submissionId: this.toObjectId(submissionId),
          choice,
          $or: [
            { rewardCoins: 0 },
            { rewardCoins: { $exists: false } },
            { rewardCoins: null },
          ],
        }).lean<MongoCommunityVoteRecord[]>()) as MongoCommunityVoteRecord[]

        return votes
          .map((vote) => this.mapper.toVoteEntity(vote))
          .filter((vote): vote is NonNullable<typeof vote> => Boolean(vote))
      },
    )
  }

  async markVerificationVoteRewarded(
    voteId: string,
    rewardCoins: number,
  ): Promise<boolean> {
    return this.execute(
      'COMMUNITY_VOTE_REWARD_MARK_FAILED',
      'Failed to mark verification vote as rewarded',
      async () => {
        if (!this.isValidObjectId(voteId)) {
          return false
        }

        const result = await CommunityReviewVoteModel.updateOne(
          {
            _id: this.toObjectId(voteId),
            $or: [
              { rewardCoins: 0 },
              { rewardCoins: { $exists: false } },
              { rewardCoins: null },
            ],
          },
          {
            $set: { rewardCoins },
          },
        )

        return Number(result.modifiedCount ?? 0) > 0
      },
    )
  }

  async findVerificationLeaderboard(userId: string, limit: number) {
    return this.execute(
      'COMMUNITY_LEADERBOARD_READ_FAILED',
      'Failed to read community leaderboard',
      async () => {
        const rows =
          (await CommunityReviewVoteModel.aggregate<MongoCommunityLeaderboardAggregate>([
            {
              $group: {
                _id: '$userId',
                totalEarned: { $sum: '$rewardCoins' },
                reviewed: { $sum: 1 },
              },
            },
            { $sort: { totalEarned: -1, reviewed: -1 } },
            { $limit: limit },
          ])) as MongoCommunityLeaderboardAggregate[]

        const userIds = rows.map((row) => this.toExistingObjectId(row._id))
        const [profiles, users] = (await Promise.all([
          CommunityUserProfileModel.find({
            userId: { $in: userIds },
            deletedAt: null,
          }).lean<MongoUserProfileRecord[]>(),
          CommunityUserModel.find({
            _id: { $in: userIds },
            deletedAt: null,
          }).lean<MongoUserRecord[]>(),
        ])) as [MongoUserProfileRecord[], MongoUserRecord[]]
        const profileByUserId = new Map(
          profiles.map((profile) => [String(profile.userId), profile]),
        )
        const userById = new Map(users.map((user) => [String(user._id), user]))

        return rows.map((row, index) =>
          this.mapper.toLeaderboardEntryEntity({
            userId: String(row._id),
            rank: index + 1,
            profile: profileByUserId.get(String(row._id)),
            user: userById.get(String(row._id)),
            earnedCoins: row.totalEarned,
            isCurrentUser: String(row._id) === userId,
          }),
        )
      },
    )
  }

  private async markDashboardTrackers(
    trackers: MongoCommunityTrackerRecord[],
    userId: string,
  ): Promise<MongoCommunityTrackerRecord[]> {
    if (!trackers.length) {
      return trackers
    }

    const userObjectId = this.toObjectId(userId)
    const trackerIds = trackers.map((tracker) =>
      this.toExistingObjectId(tracker._id),
    )
    const [clones, progressRows] = (await Promise.all([
      CommunityTrackerModel.find({
        ownerId: userObjectId,
        sourceTrackerId: { $in: trackerIds },
        deletedAt: null,
      }).lean<MongoCommunityTrackerRecord[]>(),
      CommunityTrackerProgressModel.find({
        userId: userObjectId,
        trackerId: { $in: trackerIds },
      }).lean<MongoTrackerProgressRecord[]>(),
    ])) as [MongoCommunityTrackerRecord[], MongoTrackerProgressRecord[]]

    const clonedSourceIds = new Set(
      clones
        .map((clone) => clone.sourceTrackerId?.toString())
        .filter((value): value is string => Boolean(value)),
    )
    const progressTrackerIds = new Set(
      progressRows.map((progress) => progress.trackerId.toString()),
    )

    return trackers.map((tracker) => ({
      ...tracker,
      inDashboard:
        tracker.ownerId.toString() === userId ||
        clonedSourceIds.has(tracker._id.toString()) ||
        progressTrackerIds.has(tracker._id.toString()),
    }))
  }

  private buildPublicTrackerQuery(query: FindCommunityTrackersQuery): TrackerQuery {
    const search = this.normalizeSearch(query.search)
    const filters: TrackerQuery = this.publicTrackerVisibilityQuery()

    if (search) {
      const regex = new RegExp(this.escapeRegex(search), 'i')

      filters.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { field: regex },
        { tags: regex },
      ]
    }

    if (query.topics?.length) {
      filters.category = {
        $in: query.topics
          .map((topic) => this.normalizeTopic(topic))
          .filter(Boolean),
      }
    }

    if (query.minRating !== null && query.minRating !== undefined) {
      filters.ratingAverage = { $gte: query.minRating }
    }

    if (query.verifiedOnly) {
      filters.verificationStatus = 'verified'
    }

    return filters
  }

  private buildTrackerSort(sort?: string): Record<string, 1 | -1> {
    if (sort === 'most-cloned') {
      return { cloneCount: -1, createdAt: -1 }
    }

    if (sort === 'newest') {
      return { createdAt: -1 }
    }

    return { ratingAverage: -1, cloneCount: -1, createdAt: -1 }
  }

  private publicTrackerVisibilityQuery(): TrackerQuery {
    return {
      deletedAt: null,
      visibility: 'public',
      status: 'active',
    }
  }

  private openSubmissionQuery(excludeOwnerId?: string): SubmissionQuery {
    const query: SubmissionQuery = {
      deletedAt: null,
      status: 'open',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    }

    if (excludeOwnerId) {
      query.ownerId = { $ne: this.toObjectId(excludeOwnerId) }
    }

    return query
  }

  private prepareCloneData(source: MongoCommunityTrackerRecord, userId: string) {
    const now = new Date()

    return {
      ownerId: this.toObjectId(userId),
      title: source.title,
      slug: this.createCloneSlug(source, userId),
      description: source.description ?? '',
      category: source.category ?? 'general',
      field: source.field ?? '',
      goal: source.goal ?? '',
      level: source.level ?? 'beginner',
      tags: source.tags ?? [],
      allowClone: false,
      sourceTrackerId: this.toExistingObjectId(source._id),
      visibility: 'private',
      status: 'active',
      verificationStatus: null,
      verifiedAt: null,
      isAIGenerated: Boolean(source.isAIGenerated),
      coverImageUrl: source.coverImageUrl ?? '',
      topicsCount: source.topicsCount ?? 0,
      subtopicsCount: source.subtopicsCount ?? 0,
      cloneCount: 0,
      likeCount: 0,
      saveCount: 0,
      progressPercent: 0,
      ratingAverage: 0,
      ratingCount: 0,
      publishedAt: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    }
  }

  private async cloneTrackerContent(
    sourceTrackerId: MongoIdLike,
    clonedTrackerId: MongoIdLike,
  ): Promise<void> {
    const sourceTrackerObjectId = this.toExistingObjectId(sourceTrackerId)
    const clonedTrackerObjectId = this.toExistingObjectId(clonedTrackerId)

    const sourceTopics = (await CommunityTrackerTopicModel.find({
      trackerId: sourceTrackerObjectId,
      deletedAt: null,
    })
      .sort({ order: 1 })
      .lean<MongoTrackerTopicRecord[]>()) as MongoTrackerTopicRecord[]

    const topicIdMap = new Map<string, MongoIdLike>()

    for (const topic of sourceTopics) {
      const createdTopic = await CommunityTrackerTopicModel.create({
        trackerId: clonedTrackerObjectId,
        title: topic.title,
        description: topic.description ?? '',
        order: topic.order,
        status: topic.order === 1 ? 'active' : (topic.status ?? 'locked'),
        estimatedHours: topic.estimatedHours ?? 0,
        progressPercent: 0,
        deletedAt: null,
      })

      topicIdMap.set(String(topic._id), createdTopic._id as MongoIdLike)
    }

    const sourceSubtopics = (await CommunityTrackerSubtopicModel.find({
      trackerId: sourceTrackerObjectId,
      deletedAt: null,
    })
      .sort({ depth: 1, order: 1 })
      .lean<MongoTrackerSubtopicRecord[]>()) as MongoTrackerSubtopicRecord[]

    const subtopicIdMap = new Map<string, MongoIdLike>()

    for (const subtopic of sourceSubtopics) {
      const mappedTopicId = topicIdMap.get(String(subtopic.topicId))

      if (!mappedTopicId) {
        continue
      }

      const mappedParentId = subtopic.parentSubtopicId
        ? subtopicIdMap.get(String(subtopic.parentSubtopicId)) ?? null
        : null
      const createdSubtopic = await CommunityTrackerSubtopicModel.create({
        trackerId: clonedTrackerObjectId,
        topicId: this.toExistingObjectId(mappedTopicId),
        parentSubtopicId: mappedParentId
          ? this.toExistingObjectId(mappedParentId)
          : null,
        title: subtopic.title,
        description: subtopic.description ?? '',
        order: subtopic.order,
        depth: subtopic.depth,
        isLocked: subtopic.depth === 1 ? false : Boolean(subtopic.isLocked),
        estimatedMinutes: subtopic.estimatedMinutes ?? 0,
        deletedAt: null,
      })

      subtopicIdMap.set(
        String(subtopic._id),
        createdSubtopic._id as MongoIdLike,
      )
    }
  }

  private async createInitialProgress(
    userId: string,
    tracker: MongoCommunityTrackerRecord,
  ): Promise<void> {
    await CommunityTrackerProgressModel.findOneAndUpdate(
      {
        userId: this.toObjectId(userId),
        trackerId: this.toExistingObjectId(tracker._id),
      },
      {
        $setOnInsert: {
          totalTopics: tracker.topicsCount ?? 0,
          completedTopics: 0,
          totalSubtopics: tracker.subtopicsCount ?? 0,
          completedSubtopics: 0,
          completionPercentage: 0,
          lastStudiedAt: null,
          startedAt: new Date(),
          completedAt: null,
        },
      },
      { upsert: true, new: true },
    )
  }

  private async closeSubmissionIfConsensusReached(
    submissionId: string,
  ): Promise<void> {
    const submission = await CommunityVerificationSubmissionModel.findById(
      this.toObjectId(submissionId),
    ).lean<MongoCommunitySubmissionRecord>()

    if (!submission || submission.status !== 'open') {
      return
    }

    const passVotes = Number(submission.passVotes ?? 0)
    const failVotes = Number(submission.failVotes ?? 0)
    const requiredVotes = Math.max(Number(submission.requiredVotes ?? 10), 1)
    const totalVotes = passVotes + failVotes
    const progress = Math.min(Math.round((totalVotes / requiredVotes) * 100), 100)

    if (totalVotes < requiredVotes) {
      await CommunityVerificationSubmissionModel.updateOne(
        { _id: submission._id },
        { $set: { progress } },
      )
      return
    }

    const consensusChoice: VerificationVoteChoice =
      passVotes >= failVotes ? 'pass' : 'fail'
    const status = consensusChoice === 'pass' ? 'approved' : 'rejected'

    await CommunityVerificationSubmissionModel.updateOne(
      { _id: submission._id },
      {
        $set: {
          status,
          consensusChoice,
          progress: 100,
        },
      },
    )

    await CommunityTrackerModel.updateOne(
      { _id: submission.trackerId },
      {
        $set: {
          verificationStatus:
            consensusChoice === 'pass' ? 'verified' : 'rejected',
          verifiedAt: consensusChoice === 'pass' ? new Date() : null,
        },
      },
    )
  }

  private createCloneSlug(
    source: MongoCommunityTrackerRecord,
    userId: string,
  ): string {
    const sourceSlug = source.slug || this.slugify(source.title)
    const suffix = `${userId.slice(-6)}-${Date.now().toString(36)}`

    return `${sourceSlug}-clone-${suffix}`.toLowerCase().slice(0, 120)
  }

  private slugify(value: string): string {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return slug || 'community-tracker'
  }
}

export const mongoCommunityRepository = new MongoCommunityRepository()