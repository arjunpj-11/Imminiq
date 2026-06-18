// apps/api/src/modules/trackers/infrastructure/repositories/mongo-tracker.repository.ts

import { Types } from 'mongoose'

import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerTopic } from '../../../../infrastructure/database/models/tracker-topic.model'
import { TrackerSubtopic } from '../../../../infrastructure/database/models/tracker-subtopic.model'
import { AIGenerationJob } from '../../../../infrastructure/database/models/ai-generation-job.model'
import { TrackerLesson } from '../../../../infrastructure/database/models/tracker-lesson.model'
import { UserSubtopicProgress } from '../../../../infrastructure/database/models/user-subtopic-progress.model'
import { UserTopicProgress } from '../../../../infrastructure/database/models/user-topic-progress.model'
import { TrackerProgress } from '../../../../infrastructure/database/models/tracker-progress.model'
import { StreakHistory } from '../../../../infrastructure/database/models/streak-history.model'
import { StreakSnapshot } from '../../../../infrastructure/database/models/streak-snapshot.model'
import { LessonChatMessage } from '../../../../infrastructure/database/models/lesson-chat-message.model'
import { LessonAnswerAttempt } from '../../../../infrastructure/database/models/lesson-answer-attempt.model'
import { LessonCodeSubmission } from '../../../../infrastructure/database/models/lesson-code-submission.model'
import { LessonGeneratedQuestion } from '../../../../infrastructure/database/models/lesson-generated-question.model'
import { LessonQuestionSolution } from '../../../../infrastructure/database/models/lesson-question-solution.model'
import { LessonQuestionSolutionDoubt } from '../../../../infrastructure/database/models/lesson-question-solution-doubt.model'
import { LessonVisualization } from '../../../../infrastructure/database/models/lesson-visualization.model'
 

import { TrackerDomainError } from '../../domain/errors/tracker-domain.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type {
  CreateTrackerInput,
  CreateTrackerTopicInput,
  CreateTrackerSubtopicInput,
  CreatedTrackerTopicRecord,
  CreatedTrackerSubtopicRecord,
  EvaluationJobRecord,
  GeneratedTrackerLessonRecord,
  LastSiblingSubtopicRecord,
  LastTopicRecord,
  SubtopicWithProgressRecord,
  TrackerListFilter,
  TrackerProgressRecord,
  TrackerRecord,
  TrackerSubtopicRecord,
  TrackerTopicRecord,
  UpdateTrackerInput,
  UpdateSubtopicProgressInput,
  UserSubtopicProgressRecord,
  UserTopicProgressRecord,
  TopicWithProgressRecord
} from '../../domain/types/trackers.types'

// ─── Type helpers ─────────────────────────────────────────────────────────────

type MongoPrimitive = string | number | boolean | null | Date | Types.ObjectId

type MongoOperatorValue = {
  $ne?: MongoPrimitive
  $gt?: string | number | Date
  $gte?: string | number | Date
  $lte?: string | number | Date
  $in?: Array<string | number | Types.ObjectId>
}

type MongoValue = MongoPrimitive | MongoPrimitive[] | MongoOperatorValue
type MongoQuery = Record<string, MongoValue>
type MongoUpdateValue = MongoPrimitive | MongoPrimitive[] | Record<string, unknown>
type MongoUpdate = Record<string, MongoUpdateValue>
type MongoSortOrder = 1 | -1
type StreakIntensityLevel = 'none' | 'low' | 'medium' | 'high'


export class MongoTrackerRepository implements TrackerRepositoryContract {
  private toObjectId(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new TrackerDomainError(
        'INVALID_OBJECT_ID',
        'Invalid tracker identifier',
      )
    }

    return new Types.ObjectId(value)
  }

  private asMongoFilter(query: MongoQuery): never {
    return query as never
  }

  private asMongoUpdate(update: Record<string, unknown>): never {
    return update as never
  }

  private asMongoCreatePayload(payload: Record<string, unknown>): never {
    return payload as never
  }

  private buildTrackerSort(
    sortBy: TrackerListFilter['sortBy']
  ): Record<string, MongoSortOrder> {
    if (sortBy === 'createdAt') return { createdAt: -1 }
    if (sortBy === 'progress') return { progressPercent: -1, lastActiveAt: -1 }
    if (sortBy === 'title') return { title: 1 }
    return { lastActiveAt: -1, updatedAt: -1 }
  }

  private getUtcDayStart(date = new Date()): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    )
  }

  private getPreviousUtcDayStart(date: Date): Date {
    const previous = new Date(date)
    previous.setUTCDate(previous.getUTCDate() - 1)
    return previous
  }

  private getIntensityLevel(activityCount: number): StreakIntensityLevel {
    if (activityCount <= 0) return 'none'
    if (activityCount < 3) return 'low'
    if (activityCount < 6) return 'medium'
    return 'high'
  }

  private readonly updateUserStreakAfterTrackerActivity = async ({
    userObjId,
    trackerObjId,
    subtopicObjId,
  }: {
    userObjId: Types.ObjectId
    trackerObjId: Types.ObjectId
    subtopicObjId: Types.ObjectId
  }): Promise<void> => {
    const todayStart = this.getUtcDayStart()
    const yesterdayStart = this.getPreviousUtcDayStart(todayStart)
    const heatmapKey = todayStart.toISOString().slice(0, 10)
    const source = `tracker:${trackerObjId.toString()}:subtopic:${subtopicObjId.toString()}`

    const existingToday = await StreakHistory.findOne(
      this.asMongoFilter({
        userId: userObjId,
        date: todayStart,
        deletedAt: null,
      })
    ).lean()

    const yesterdayHistory = await StreakHistory.findOne(
      this.asMongoFilter({
        userId: userObjId,
        date: yesterdayStart,
        deletedAt: null,
      })
    ).lean()

    const yesterdayContinuesStreak =
      Boolean(yesterdayHistory) &&
      ((yesterdayHistory.activityCount ?? 0) > 0 || yesterdayHistory.isFrozen)

    const streakDay =
      existingToday?.streakDay && existingToday.streakDay > 0
        ? existingToday.streakDay
        : yesterdayContinuesStreak
          ? (yesterdayHistory?.streakDay ?? 0) + 1
          : 1

    const todayHistory = await StreakHistory.findOneAndUpdate(
      this.asMongoFilter({
        userId: userObjId,
        date: todayStart,
        deletedAt: null,
      }),
      this.asMongoUpdate({
        $setOnInsert: {
          userId: userObjId,
          date: todayStart,
          streakDay,
          isFrozen: false,
          freezeUsedId: null,
          deletedAt: null,
        },
        $inc: {
          activityCount: 1,
        },
        $addToSet: {
          sources: source,
        },
      }),
      {
        upsert: true,
        returnDocument: 'after',
      }
    ).lean()

    const activityCount = todayHistory?.activityCount ?? 1
    const intensityLevel = this.getIntensityLevel(activityCount)

    await StreakHistory.findOneAndUpdate(
      this.asMongoFilter({
        userId: userObjId,
        date: todayStart,
        deletedAt: null,
      }),
      this.asMongoUpdate({
        $set: {
          intensityLevel,
          streakDay,
        },
      })
    )

    const [totalActiveDays, totalFreezeUsed, latestSnapshot] = await Promise.all([
      StreakHistory.countDocuments(
        this.asMongoFilter({
          userId: userObjId,
          deletedAt: null,
          activityCount: { $gt: 0 },
        })
      ),
      StreakHistory.countDocuments(
        this.asMongoFilter({
          userId: userObjId,
          deletedAt: null,
          isFrozen: true,
        })
      ),
      StreakSnapshot.findOne(
        this.asMongoFilter({
          userId: userObjId,
          deletedAt: null,
        })
      )
        .sort({ snapshotDate: -1 })
        .lean(),
    ])

    const currentStreak = streakDay
    const longestStreak = Math.max(
      latestSnapshot?.longestStreak ?? 0,
      currentStreak
    )

    const previousHeatmapData =
      latestSnapshot?.heatmapData &&
      typeof latestSnapshot.heatmapData === 'object'
        ? latestSnapshot.heatmapData
        : {}

    await StreakSnapshot.findOneAndUpdate(
      this.asMongoFilter({
        userId: userObjId,
        snapshotDate: todayStart,
        deletedAt: null,
      }),
      this.asMongoUpdate({
        $setOnInsert: {
          userId: userObjId,
          snapshotDate: todayStart,
          deletedAt: null,
        },
        $set: {
          currentStreak,
          longestStreak,
          totalActiveDays,
          totalFreezeUsed,
          heatmapData: {
            ...previousHeatmapData,
            [heatmapKey]: {
              activityCount,
              intensityLevel,
              streakDay,
              isFrozen: false,
              sources: todayHistory?.sources ?? [source],
            },
          },
        },
      }),
      {
        upsert: true,
        returnDocument: 'after',
      }
    )
  }

// ─── Tracker CRUD ──────────────────────────────────────────────────────────
  readonly hasAnyTrackerForUser: TrackerRepositoryContract['hasAnyTrackerForUser'] = async (userId) => {
    const tracker = await Tracker.exists(
      this.asMongoFilter({ ownerId: this.toObjectId(userId), deletedAt: null })
    )
    return Boolean(tracker)
  }
  readonly getTrackerSummary: TrackerRepositoryContract['getTrackerSummary'] = async (userId) => {
    const ownerId = this.toObjectId(userId)
    const base: MongoQuery = { ownerId, deletedAt: null }

    const [total, active, completed, published, progressAgg] = await Promise.all([
      Tracker.countDocuments(this.asMongoFilter(base)),
      Tracker.countDocuments(this.asMongoFilter({ ...base, status: 'active' })),
      Tracker.countDocuments(this.asMongoFilter({ ...base, status: 'completed' })),
      Tracker.countDocuments(
        this.asMongoFilter({ ...base, visibility: 'public', publishedAt: { $ne: null } })
      ),
      Tracker.aggregate([
        { $match: base },
        { $group: { _id: null, avg: { $avg: '$progressPercent' } } },
      ]),
    ])

    return {
      totalTrackers: total,
      activeTrackers: active,
      completedTrackers: completed,
      publishedTrackers: published,
      averageProgress: Math.round(progressAgg[0]?.avg || 0),
    }
  }
  readonly listOwnedTrackers: TrackerRepositoryContract['listOwnedTrackers'] = async ({ userId, status = 'all', domain = 'all', sortBy = 'lastActive', page, limit }) => {
  const query: MongoQuery = { ownerId: this.toObjectId(userId), deletedAt: null }
  if (status !== 'all') query.status = status
  if (domain !== 'all') query.domain = domain

  const skip = (page - 1) * limit

  const [trackers, total] = await Promise.all([
    Tracker.find(this.asMongoFilter(query))
      .sort(this.buildTrackerSort(sortBy))
      .skip(skip)
      .limit(limit)
      .lean(),
    Tracker.countDocuments(this.asMongoFilter(query)),
  ])

  // 👈 fetch progress for all returned trackers in one query
  const trackerIds = trackers.map((t) => t._id)

  const progressList = await TrackerProgress.find(
    this.asMongoFilter({ userId: this.toObjectId(userId), trackerId: { $in: trackerIds } })
  )
    .select('trackerId completedTopics totalTopics')
    .lean()

  const progressMap = new Map(
    progressList.map((p) => [p.trackerId.toString(), p])
  )

  const enrichedTrackers = trackers.map((tracker) => {
    const progress = progressMap.get(tracker._id.toString())
    return {
      ...tracker,
      completedTopics: progress?.completedTopics ?? 0,
      totalTopics: progress?.totalTopics ?? tracker.topicsCount ?? 0,
    }
  })

  return {
    trackers: enrichedTrackers as TrackerRecord[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

  readonly createTracker: TrackerRepositoryContract['createTracker'] = async (data: CreateTrackerInput) => {
    const tracker = await Tracker.create(this.asMongoCreatePayload({
      ownerId: this.toObjectId(data.userId),
      title: data.title,
      description: data.description || '',
      domain: data.domain || 'other',
      goal: data.goal || '',
      level: data.level || 'beginner',
      status: 'active',
      visibility: data.visibility || 'private',
      progressPercent: 0,
      topicsCount: 0,
      subtopicsCount: 0,
      completedSubtopicsCount: 0,
      lastActiveAt: new Date(),
      publishedAt: null,
      completedAt: null,
      deletedAt: null,
    }))
    return tracker as TrackerRecord
  }
  readonly updateOwnedTracker: TrackerRepositoryContract['updateOwnedTracker'] = async (data: UpdateTrackerInput) => {
    const update: MongoUpdate = {}
    if (data.title !== undefined) update.title = data.title
    if (data.description !== undefined) update.description = data.description
    if (data.domain !== undefined) update.domain = data.domain
    if (data.goal !== undefined) update.goal = data.goal
    if (data.level !== undefined) update.level = data.level

    const tracker = await Tracker.findOneAndUpdate(
      this.asMongoFilter({ _id: this.toObjectId(data.trackerId), ownerId: this.toObjectId(data.userId), deletedAt: null }),
      this.asMongoUpdate({ $set: update }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  }
  readonly softDeleteOwnedTracker: TrackerRepositoryContract['softDeleteOwnedTracker'] = async ({ trackerId, userId }) => {
    const tracker = await Tracker.findOneAndUpdate(
      this.asMongoFilter({ _id: this.toObjectId(trackerId), ownerId: this.toObjectId(userId), deletedAt: null }),
      this.asMongoUpdate({ $set: { deletedAt: new Date() } }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  }
  readonly findOwnedTrackerById: TrackerRepositoryContract['findOwnedTrackerById'] = async (trackerId, userId) => {
    const tracker = await Tracker.findOne(
      this.asMongoFilter({ _id: this.toObjectId(trackerId), ownerId: this.toObjectId(userId), deletedAt: null })
    )
    return tracker as TrackerRecord | null
  }
  readonly archiveOwnedTracker: TrackerRepositoryContract['archiveOwnedTracker'] = async ({ trackerId, userId }) => {
    const tracker = await Tracker.findOneAndUpdate(
      this.asMongoFilter({ _id: this.toObjectId(trackerId), ownerId: this.toObjectId(userId), deletedAt: null }),
      this.asMongoUpdate({ $set: { status: 'archived' } }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  }
  readonly restoreOwnedTracker: TrackerRepositoryContract['restoreOwnedTracker'] = async ({ trackerId, userId }) => {
    const tracker = await Tracker.findOneAndUpdate(
      this.asMongoFilter({ _id: this.toObjectId(trackerId), ownerId: this.toObjectId(userId), deletedAt: null }),
      this.asMongoUpdate({ $set: { status: 'active' } }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  }
  readonly publishOwnedTracker: TrackerRepositoryContract['publishOwnedTracker'] = async ({
  trackerId,
  userId,
  name,
  description,
  domain,
  difficulty,
  tags,
  allowClone,
}) => {
  const update: Record<string, unknown> = {
    visibility: 'public',
    publishedAt: new Date(),
  }

  if (typeof name === 'string' && name.trim()) {
    update.title = name.trim()
  }

  if (typeof description === 'string') {
    update.description = description.trim()
  }

  if (typeof domain === 'string' && domain.trim()) {
    update.field = domain.trim()
  }

  if (
    difficulty === 'beginner' ||
    difficulty === 'intermediate' ||
    difficulty === 'advanced'
  ) {
    update.level = difficulty
  }

  if (Array.isArray(tags)) {
    update.tags = tags
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean)
  }

  if (typeof allowClone === 'boolean') {
    update.allowClone = allowClone
  }

  const tracker = await Tracker.findOneAndUpdate(
    this.asMongoFilter({
      _id: this.toObjectId(trackerId),
      ownerId: this.toObjectId(userId),
      deletedAt: null,
    }),
    this.asMongoUpdate({
      $set: update,
    }),
    { returnDocument: 'after' }
  )

  return tracker as TrackerRecord | null
}

  readonly unpublishOwnedTracker: TrackerRepositoryContract['unpublishOwnedTracker'] = async ({ trackerId, userId }) => {
    const tracker = await Tracker.findOneAndUpdate(
      this.asMongoFilter({ _id: this.toObjectId(trackerId), ownerId: this.toObjectId(userId), deletedAt: null }),
      this.asMongoUpdate({ $set: { visibility: 'private', publishedAt: null } }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  }
  // ─── Topics & Subtopics (content) ──────────────────────────────────────────
  readonly findEvaluationJobById: TrackerRepositoryContract['findEvaluationJobById'] = async (evaluationJobId, userId) => {
    const job = await AIGenerationJob.findOne(
      this.asMongoFilter({ _id: this.toObjectId(evaluationJobId), userId: this.toObjectId(userId), jobType: 'evaluation' })
    )
    return job as EvaluationJobRecord | null
  }
  readonly getTopicsForTracker: TrackerRepositoryContract['getTopicsForTracker'] = async (trackerId) => {
    const topics = await TrackerTopic.find(
      this.asMongoFilter({ trackerId: this.toObjectId(trackerId), deletedAt: null })
    ).sort({ order: 1 })
    return topics as TrackerTopicRecord[]
  }
  // Content only — no progress fields
  readonly getSubtopicsForTracker: TrackerRepositoryContract['getSubtopicsForTracker'] = async (trackerId) => {
    const subtopics = await TrackerSubtopic.find(
      this.asMongoFilter({ trackerId: this.toObjectId(trackerId), deletedAt: null })
    ).sort({ depth: 1, order: 1 })
    return subtopics as TrackerSubtopicRecord[]
  }
  // Content merged with this user's per-user progress
  readonly getSubtopicsWithUserProgress: TrackerRepositoryContract['getSubtopicsWithUserProgress'] = async ({ trackerId, userId }) => {
    const trackerObjId = this.toObjectId(trackerId)
    const userObjId = this.toObjectId(userId)

    const [subtopics, userProgress] = await Promise.all([
      TrackerSubtopic.find(
        this.asMongoFilter({ trackerId: trackerObjId, deletedAt: null })
      ).sort({ depth: 1, order: 1 }).lean(),
      UserSubtopicProgress.find(
        this.asMongoFilter({ userId: userObjId, trackerId: trackerObjId })
      ).lean(),
    ])

    const progressMap = new Map(
      userProgress.map((p) => [p.subtopicId.toString(), p])
    )

    return subtopics.map((subtopic) => {
      const progress = progressMap.get(subtopic._id.toString())
      const defaultStatus = subtopic.isLocked ? 'locked' : 'available'
      return {
        _id: subtopic._id,
        trackerId: subtopic.trackerId,
        topicId: subtopic.topicId,
        parentSubtopicId: subtopic.parentSubtopicId ?? null,
        title: subtopic.title,
        description: subtopic.description,
        order: subtopic.order,
        depth: subtopic.depth,
        isLocked: subtopic.isLocked,
        estimatedMinutes: subtopic.estimatedMinutes || 0,
        status: (progress?.status ?? defaultStatus) as SubtopicWithProgressRecord['status'],
        isUnlocked: progress ? progress.isUnlocked : !subtopic.isLocked,
        progressPercent: progress?.progressPercent ?? 0,
        completedAt: progress?.completedAt ?? null,
      } as SubtopicWithProgressRecord
    })
  }
  readonly getSubtopicById: TrackerRepositoryContract['getSubtopicById'] = async ({ trackerId, subtopicId }) => {
    const subtopic = await TrackerSubtopic.findOne(
      this.asMongoFilter({ _id: this.toObjectId(subtopicId), trackerId: this.toObjectId(trackerId), deletedAt: null })
    )
    return subtopic as TrackerSubtopicRecord | null
  }
  readonly findLastTopicForTracker: TrackerRepositoryContract['findLastTopicForTracker'] = async (trackerId) => {
    const topic = await TrackerTopic.findOne(
      this.asMongoFilter({ trackerId: this.toObjectId(trackerId), deletedAt: null })
    ).sort({ order: -1 })
    return topic as LastTopicRecord | null
  }
  readonly shiftTopicOrdersFrom: TrackerRepositoryContract['shiftTopicOrdersFrom'] = async ({ trackerId, fromOrder }) => {
    return TrackerTopic.updateMany(
      this.asMongoFilter({ trackerId: this.toObjectId(trackerId), order: { $gte: fromOrder }, deletedAt: null }),
      this.asMongoUpdate({ $inc: { order: 1 } })
    )
  }
  readonly createTrackerTopic: TrackerRepositoryContract['createTrackerTopic'] = async (data: CreateTrackerTopicInput) => {
    const topic = await TrackerTopic.create(this.asMongoCreatePayload({
      trackerId: this.toObjectId(data.trackerId),
      title: data.title,
      description: data.description,
      order: data.order,
      estimatedHours: 0,
      deletedAt: null,
    }))
    return topic as CreatedTrackerTopicRecord
  }
  readonly findLastSiblingSubtopic: TrackerRepositoryContract['findLastSiblingSubtopic'] = async ({ topicId, parentSubtopicId }) => {
    const subtopic = await TrackerSubtopic.findOne(
      this.asMongoFilter({
        topicId: this.toObjectId(topicId),
        parentSubtopicId: parentSubtopicId ? this.toObjectId(parentSubtopicId) : null,
        deletedAt: null,
      })
    ).sort({ order: -1 })
    return subtopic as LastSiblingSubtopicRecord | null
  }
  readonly createTrackerSubtopic: TrackerRepositoryContract['createTrackerSubtopic'] = async (data: CreateTrackerSubtopicInput) => {
    const subtopic = await TrackerSubtopic.create(this.asMongoCreatePayload({
      trackerId: this.toObjectId(data.trackerId),
      topicId: this.toObjectId(data.topicId),
      parentSubtopicId: data.parentSubtopicId ? this.toObjectId(data.parentSubtopicId) : null,
      title: data.title,
      description: data.description,
      order: data.order,
      depth: data.depth,
      // depth=1 nodes start unlocked; deeper nodes are locked until parent completes
      isLocked: data.depth !== 1,
      estimatedMinutes: data.estimatedMinutes || 0,
      deletedAt: null,
    }))
    return subtopic as CreatedTrackerSubtopicRecord
  }
  readonly incrementTrackerTopicsCount: TrackerRepositoryContract['incrementTrackerTopicsCount'] = async (trackerId) => {
    return Tracker.findByIdAndUpdate(
      this.toObjectId(trackerId),
      this.asMongoUpdate({ $inc: { topicsCount: 1 } }),
      { returnDocument: 'after' }
    )
  }
  readonly incrementTrackerSubtopicsCount: TrackerRepositoryContract['incrementTrackerSubtopicsCount'] = async (trackerId) => {
    return Tracker.findByIdAndUpdate(
      this.toObjectId(trackerId),
      this.asMongoUpdate({ $inc: { subtopicsCount: 1 } }),
      { returnDocument: 'after' }
    )
  }
  // ─── User Progress ──────────────────────────────────────────────────────────
  readonly ensureUserProgressInitialized: TrackerRepositoryContract['ensureUserProgressInitialized'] = async ({ userId, trackerId }) => {
    const userObjId = this.toObjectId(userId)
    const trackerObjId = this.toObjectId(trackerId)

    const existing = await UserSubtopicProgress.findOne(
      this.asMongoFilter({ userId: userObjId, trackerId: trackerObjId })
    )
    if (existing) return

    const [topics, subtopics] = await Promise.all([
      TrackerTopic.find(
        this.asMongoFilter({ trackerId: trackerObjId, deletedAt: null })
      ).sort({ order: 1 }).lean(),
      TrackerSubtopic.find(
        this.asMongoFilter({ trackerId: trackerObjId, deletedAt: null })
      ).sort({ depth: 1, order: 1 }).lean(),
    ])

    if (topics.length > 0) {
      await UserTopicProgress.insertMany(
        topics.map((topic) => ({
          userId: userObjId,
          trackerId: trackerObjId,
          topicId: topic._id,
          status: 'active',
          progressPercent: 0,
          completedAt: null,
        }))
      )
    }

    if (subtopics.length > 0) {
      await UserSubtopicProgress.insertMany(
        subtopics.map((subtopic) => ({
          userId: userObjId,
          trackerId: trackerObjId,
          topicId: subtopic.topicId,
          subtopicId: subtopic._id,
          status: subtopic.isLocked ? 'locked' : 'available',
          isUnlocked: !subtopic.isLocked,
          progressPercent: 0,
          completedAt: null,
        }))
      )
    }

    await TrackerProgress.findOneAndUpdate(
      this.asMongoFilter({ userId: userObjId, trackerId: trackerObjId }),
      this.asMongoUpdate({
        $setOnInsert: {
          userId: userObjId,
          trackerId: trackerObjId,
          totalTopics: topics.length,
          completedTopics: 0,
          totalSubtopics: subtopics.length,
          completedSubtopics: 0,
          completionPercentage: 0,
          lastStudiedAt: null,
          startedAt: new Date(),
          completedAt: null,
        },
      }),
      { upsert: true }
    )
  }
  readonly getUserSubtopicsProgress: TrackerRepositoryContract['getUserSubtopicsProgress'] = async ({ userId, trackerId }) => {
    const docs = await UserSubtopicProgress.find(
      this.asMongoFilter({ userId: this.toObjectId(userId), trackerId: this.toObjectId(trackerId) })
    ).lean()
    return docs as UserSubtopicProgressRecord[]
  }
  readonly getUserTopicsProgress: TrackerRepositoryContract['getUserTopicsProgress'] = async ({ userId, trackerId }) => {
    const docs = await UserTopicProgress.find(
      this.asMongoFilter({ userId: this.toObjectId(userId), trackerId: this.toObjectId(trackerId) })
    ).lean()
    return docs as UserTopicProgressRecord[]
  }
  readonly updateSubtopicProgress: TrackerRepositoryContract['updateSubtopicProgress'] = async ({
  trackerId,
  subtopicId,
  userId,
  status,
}: UpdateSubtopicProgressInput) => {
  const userObjId = this.toObjectId(userId)
  const subtopicObjId = this.toObjectId(subtopicId)
  const trackerObjId = this.toObjectId(trackerId)

  const subtopic = await TrackerSubtopic.findOne(
    this.asMongoFilter({
      _id: subtopicObjId,
      trackerId: trackerObjId,
      deletedAt: null,
    })
  ).lean()

  if (!subtopic) return null

  const now = new Date()

  const previousProgress = await UserSubtopicProgress.findOne(
    this.asMongoFilter({
      userId: userObjId,
      trackerId: trackerObjId,
      subtopicId: subtopicObjId,
    })
  ).lean()

  const progressUpdate: Record<string, unknown> = {
    status,
    isUnlocked: true,
  }

  if (status === 'completed') {
    progressUpdate.progressPercent = 100
    progressUpdate.completedAt = previousProgress?.completedAt ?? now
  } else if (status === 'in_progress') {
    progressUpdate.progressPercent = 50
    progressUpdate.completedAt = null
  } else if (status === 'available') {
    progressUpdate.progressPercent = 0
    progressUpdate.completedAt = null
  }

  const userProgress = await UserSubtopicProgress.findOneAndUpdate(
    this.asMongoFilter({
      userId: userObjId,
      trackerId: trackerObjId,
      subtopicId: subtopicObjId,
    }),
    this.asMongoUpdate({
      $setOnInsert: {
        userId: userObjId,
        trackerId: trackerObjId,
        topicId: subtopic.topicId,
        subtopicId: subtopicObjId,
      },
      $set: progressUpdate,
    }),
    {
      returnDocument: 'after',
      upsert: true,
    }
  )

  const [totalSubtopics, completedSubtopics, totalTopics, completedTopics] =
    await Promise.all([
      TrackerSubtopic.countDocuments(
        this.asMongoFilter({
          trackerId: trackerObjId,
          deletedAt: null,
        })
      ),

      UserSubtopicProgress.countDocuments(
        this.asMongoFilter({
          userId: userObjId,
          trackerId: trackerObjId,
          status: 'completed',
        })
      ),

      UserTopicProgress.countDocuments(
        this.asMongoFilter({
          userId: userObjId,
          trackerId: trackerObjId,
        })
      ),

      UserTopicProgress.countDocuments(
        this.asMongoFilter({
          userId: userObjId,
          trackerId: trackerObjId,
          status: 'completed',
        })
      ),
    ])

  const completionPercentage =
    totalSubtopics > 0
      ? Math.min(100, Math.round((completedSubtopics / totalSubtopics) * 100))
      : 0

  await Promise.all([
    Tracker.findByIdAndUpdate(
      trackerObjId,
      this.asMongoUpdate({
        $set: {
          lastActiveAt: now,
        },
      })
    ),

    TrackerProgress.findOneAndUpdate(
      this.asMongoFilter({
        userId: userObjId,
        trackerId: trackerObjId,
      }),
      this.asMongoUpdate({
        $setOnInsert: {
          userId: userObjId,
          trackerId: trackerObjId,
        },
        $set: {
          lastStudiedAt: now,
          completedSubtopics,
          totalSubtopics,
          completedTopics,      // 👈 now tracked live
          totalTopics,          // 👈 now tracked live
          completionPercentage,
          status:
            completionPercentage >= 100
              ? 'completed'
              : completionPercentage > 0
                ? 'in_progress'
                : 'not_started',
        },
      }),
      {
        upsert: true,
        returnDocument: 'after',
      }
    ),

    this.updateUserStreakAfterTrackerActivity({
      userObjId,
      trackerObjId,
      subtopicObjId,
    }),
  ])

  return {
    _id: subtopic._id,
    trackerId: subtopic.trackerId,
    topicId: subtopic.topicId,
    parentSubtopicId: subtopic.parentSubtopicId ?? null,
    title: subtopic.title,
    description: subtopic.description,
    order: subtopic.order,
    depth: subtopic.depth,
    isLocked: subtopic.isLocked,
    estimatedMinutes: subtopic.estimatedMinutes || 0,
    status: userProgress?.status ?? status,
    isUnlocked: userProgress?.isUnlocked ?? true,
    progressPercent: userProgress?.progressPercent ?? 0,
    completedAt: userProgress?.completedAt ?? null,
  } as SubtopicWithProgressRecord
}

  readonly unlockNextSubtopic: TrackerRepositoryContract['unlockNextSubtopic'] = async ({
    trackerId,
    topicId,
    completedSubtopicOrder,
    userId,
  }) => {
    const trackerObjId = this.toObjectId(trackerId)
    const userObjId = this.toObjectId(userId)

    const nextSubtopic = await TrackerSubtopic.findOne(
      this.asMongoFilter({
        trackerId: trackerObjId,
        topicId: this.toObjectId(topicId),
        order: { $gt: completedSubtopicOrder },
        deletedAt: null,
      })
    ).sort({ order: 1 }).lean()

    if (!nextSubtopic) return null

    return UserSubtopicProgress.findOneAndUpdate(
      this.asMongoFilter({ userId: userObjId, subtopicId: nextSubtopic._id }),
      this.asMongoUpdate({ $set: { isUnlocked: true, status: 'available' } }),
      { returnDocument: 'after', upsert: true }
    )
  }
  readonly checkAndCompleteParentSubtopic: TrackerRepositoryContract['checkAndCompleteParentSubtopic'] = async ({
    trackerId,
    topicId,
    parentSubtopicId,
    userId,
  }) => {
    const userObjId = this.toObjectId(userId)
    const trackerObjId = this.toObjectId(trackerId)
    const topicObjId = this.toObjectId(topicId)
    const parentObjId = this.toObjectId(parentSubtopicId)

    const allChildren = await TrackerSubtopic.find(
      this.asMongoFilter({
        trackerId: trackerObjId,
        topicId: topicObjId,
        parentSubtopicId: parentObjId,
        deletedAt: null,
      })
    ).lean()

    if (allChildren.length === 0) return null

    const childIds = allChildren.map((c) => c._id)
    const completedCount = await UserSubtopicProgress.countDocuments(
      this.asMongoFilter({
        userId: userObjId,
        subtopicId: { $in: childIds },
        status: 'completed',
      })
    )

    const progressPercent = Math.round(
      (completedCount / allChildren.length) * 100
    )

    if (completedCount < allChildren.length) {
      await UserSubtopicProgress.findOneAndUpdate(
        this.asMongoFilter({ userId: userObjId, subtopicId: parentObjId }),
        this.asMongoUpdate({
          $set: {
            progressPercent,
            status: 'in_progress',
            isUnlocked: true,
          },
        }),
        { upsert: true }
      )
      return null
    }

    const updatedParent = await UserSubtopicProgress.findOneAndUpdate(
      this.asMongoFilter({ userId: userObjId, subtopicId: parentObjId }),
      this.asMongoUpdate({
        $set: {
          status: 'completed',
          progressPercent: 100,
          completedAt: new Date(),
          isUnlocked: true,
        },
      }),
      { returnDocument: 'after', upsert: true }
    )

    const parentContent = await TrackerSubtopic.findById(parentObjId).lean()
    if (!parentContent) return updatedParent

    const nextSibling = await TrackerSubtopic.findOne(
      this.asMongoFilter({
        trackerId: trackerObjId,
        topicId: topicObjId,
        parentSubtopicId: parentContent.parentSubtopicId ?? null,
        order: { $gt: parentContent.order },
        deletedAt: null,
      })
    ).sort({ order: 1 }).lean()

    if (nextSibling) {
      await UserSubtopicProgress.findOneAndUpdate(
        this.asMongoFilter({ userId: userObjId, subtopicId: nextSibling._id }),
        this.asMongoUpdate({ $set: { isUnlocked: true, status: 'available' } }),
        { upsert: true }
      )
    }

    return updatedParent
  }
  readonly checkAndCompleteTopicAndUnlockNext: TrackerRepositoryContract['checkAndCompleteTopicAndUnlockNext'] = async ({
    trackerId,
    topicId,
    userId,
  }) => {
    const userObjId = this.toObjectId(userId)
    const trackerObjId = this.toObjectId(trackerId)
    const topicObjId = this.toObjectId(topicId)

    const allSubtopics = await TrackerSubtopic.find(
      this.asMongoFilter({ trackerId: trackerObjId, topicId: topicObjId, deletedAt: null })
    ).lean()

    if (allSubtopics.length === 0) return null

    const subtopicIds = allSubtopics.map((s) => s._id)
    const total = allSubtopics.length

    const completedCount = await UserSubtopicProgress.countDocuments(
      this.asMongoFilter({
        userId: userObjId,
        subtopicId: { $in: subtopicIds },
        status: 'completed',
      })
    )

    const progressPercent = Math.round((completedCount / total) * 100)

    if (completedCount < total) {
      await UserTopicProgress.findOneAndUpdate(
        this.asMongoFilter({ userId: userObjId, topicId: topicObjId }),
        this.asMongoUpdate({ $set: { progressPercent, status: 'active' } }),
        { upsert: true }
      )
      return null
    }

    const completedTopic = await UserTopicProgress.findOneAndUpdate(
      this.asMongoFilter({ userId: userObjId, topicId: topicObjId }),
      this.asMongoUpdate({
        $set: { status: 'completed', progressPercent: 100, completedAt: new Date() },
      }),
      { returnDocument: 'after', upsert: true }
    )

    const currentTopic = await TrackerTopic.findById(topicObjId).lean()
    if (!currentTopic) return completedTopic

    const nextTopic = await TrackerTopic.findOne(
      this.asMongoFilter({
        trackerId: trackerObjId,
        order: { $gt: currentTopic.order },
        deletedAt: null,
      })
    ).sort({ order: 1 }).lean()

    if (!nextTopic) return completedTopic

    await UserTopicProgress.findOneAndUpdate(
      this.asMongoFilter({ userId: userObjId, topicId: nextTopic._id }),
      this.asMongoUpdate({ $set: { status: 'active' } }),
      { upsert: true }
    )

    const firstSubtopic = await TrackerSubtopic.findOne(
      this.asMongoFilter({
        trackerId: trackerObjId,
        topicId: nextTopic._id,
        depth: 1,
        deletedAt: null,
      })
    ).sort({ order: 1 }).lean()

    if (firstSubtopic) {
      await UserSubtopicProgress.findOneAndUpdate(
        this.asMongoFilter({ userId: userObjId, subtopicId: firstSubtopic._id }),
        this.asMongoUpdate({ $set: { isUnlocked: true, status: 'available' } }),
        { upsert: true }
      )
    }

    return completedTopic
  }
  readonly recomputeTrackerProgress: TrackerRepositoryContract['recomputeTrackerProgress'] = async (trackerId, userId) => {
    const userObjId = this.toObjectId(userId)
    const trackerObjId = this.toObjectId(trackerId)

    const [totalSubtopics, completedSubtopics, totalTopics, completedTopics] =
      await Promise.all([
        UserSubtopicProgress.countDocuments(
          this.asMongoFilter({ userId: userObjId, trackerId: trackerObjId })
        ),
        UserSubtopicProgress.countDocuments(
          this.asMongoFilter({ userId: userObjId, trackerId: trackerObjId, status: 'completed' })
        ),
        UserTopicProgress.countDocuments(
          this.asMongoFilter({ userId: userObjId, trackerId: trackerObjId })
        ),
        UserTopicProgress.countDocuments(
          this.asMongoFilter({ userId: userObjId, trackerId: trackerObjId, status: 'completed' })
        ),
      ])

    const completionPercentage =
      totalSubtopics === 0
        ? 0
        : Math.round((completedSubtopics / totalSubtopics) * 100)

    await Tracker.findByIdAndUpdate(
      trackerObjId,
      this.asMongoUpdate({
        $set: {
          progressPercent: completionPercentage,
          completedSubtopicsCount: completedSubtopics,
          lastActiveAt: new Date(),
          ...(completionPercentage === 100 ? { status: 'completed', completedAt: new Date() } : {}),
        },
      })
    )

    const progress = await TrackerProgress.findOneAndUpdate(
      this.asMongoFilter({ userId: userObjId, trackerId: trackerObjId }),
      this.asMongoUpdate({
        $set: {
          totalSubtopics,
          completedSubtopics,
          totalTopics,
          completedTopics,
          completionPercentage,
          lastStudiedAt: new Date(),
          ...(completionPercentage === 100 ? { completedAt: new Date() } : {}),
        },
      }),
      { returnDocument: 'after', upsert: true }
    )

    return progress as TrackerProgressRecord | null
  }
  // ─── Lessons ───────────────────────────────────────────────────────────────
  readonly findLessonBySubtopicId: TrackerRepositoryContract['findLessonBySubtopicId'] = async ({ trackerId, subtopicId, userId }) => {
    const lesson = await TrackerLesson.findOne(
      this.asMongoFilter({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        deletedAt: null,
      })
    )
    return lesson as GeneratedTrackerLessonRecord | null
  }
  readonly createLesson: TrackerRepositoryContract['createLesson'] = async (data) => {
    const lesson = await TrackerLesson.create(this.asMongoCreatePayload({
      trackerId: this.toObjectId(data.trackerId),
      subtopicId: this.toObjectId(data.subtopicId),
      userId: this.toObjectId(data.userId),
      title: data.title,
      summary: data.summary,
      explanation: data.explanation,
      insight: data.insight,
      lessonType: data.lessonType,
      compilerRuntime: data.compilerRuntime ?? null,
      codeExample: data.codeExample,
      practiceTask: data.practiceTask,
      tags: data.tags,
      difficulty: data.difficulty,
      estimatedMinutes: data.estimatedMinutes,
      deletedAt: null,
    }))
    return lesson as GeneratedTrackerLessonRecord
  }
  readonly getLessonChatMessages: TrackerRepositoryContract['getLessonChatMessages'] = async ({
    trackerId,
    subtopicId,
    userId,
    scope = 'lesson_doubt_chat',
    questionId = null,
  }) => {
    const messages = await LessonChatMessage.find(
      this.asMongoFilter({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        scope,
        questionId,
        deletedAt: null,
      })
    )
      .sort({ createdAt: 1 })
      .lean()

    return messages
  }
  readonly createLessonChatMessage: TrackerRepositoryContract['createLessonChatMessage'] = async ({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    scope = 'lesson_doubt_chat',
    questionId = null,
    role,
    content,
  }) => {
    const message = await LessonChatMessage.create(
      this.asMongoCreatePayload({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        lessonId: lessonId ? this.toObjectId(lessonId) : null,
        scope,
        questionId,
        role,
        content,
        deletedAt: null,
      })
    )

    return message
  }
  readonly getLessonAnswerAttempts: TrackerRepositoryContract['getLessonAnswerAttempts'] = async ({
    trackerId,
    subtopicId,
    userId,
    questionId = null,
  }) => {
    const attempts = await LessonAnswerAttempt.find(
      this.asMongoFilter({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        questionId,
        deletedAt: null,
      })
    )
      .sort({ createdAt: -1 })
      .lean()

    return attempts
  }
  readonly createLessonAnswerAttempt: TrackerRepositoryContract['createLessonAnswerAttempt'] = async ({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    questionId = null,
    question,
    answer,
    feedback,
    isCorrect,
    score,
  }) => {
    const previousAttempts = await LessonAnswerAttempt.countDocuments(
      this.asMongoFilter({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        questionId,
        deletedAt: null,
      })
    )

    const attempt = await LessonAnswerAttempt.create(
      this.asMongoCreatePayload({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        lessonId: lessonId ? this.toObjectId(lessonId) : null,
        questionId,
        question,
        answer,
        feedback,
        isCorrect,
        score,
        attemptNumber: previousAttempts + 1,
        deletedAt: null,
      })
    )

    return attempt
  }
  readonly getLessonCodeSubmissions: TrackerRepositoryContract['getLessonCodeSubmissions'] = async ({
    trackerId,
    subtopicId,
    userId,
    action,
  }) => {
    const query: MongoQuery = {
      trackerId: this.toObjectId(trackerId),
      subtopicId: this.toObjectId(subtopicId),
      userId: this.toObjectId(userId),
      deletedAt: null,
    }

    if (action) {
      query.action = action
    }

    const submissions = await LessonCodeSubmission.find(
      this.asMongoFilter(query)
    )
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return submissions
  }
  readonly createLessonCodeSubmission: TrackerRepositoryContract['createLessonCodeSubmission'] = async ({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    questionId = null,
    action,
    language,
    languageId,
    sourceCode,
    stdin,
    stdout,
    stderr,
    compileOutput,
    message,
    status,
    time,
    memory,
    isCorrect,
    expectedOutput,
    actualOutput,
    feedback,
  }) => {
    const submission = await LessonCodeSubmission.create(
      this.asMongoCreatePayload({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        lessonId: lessonId ? this.toObjectId(lessonId) : null,
        questionId,
        action,
        language,
        languageId,
        sourceCode,
        stdin,
        stdout,
        stderr,
        compileOutput,
        message,
        status,
        time,
        memory,
        isCorrect,
        expectedOutput,
        actualOutput,
        feedback,
        deletedAt: null,
      })
    )

    return submission
  }
  readonly getLessonGeneratedQuestions: TrackerRepositoryContract['getLessonGeneratedQuestions'] = async ({
    trackerId,
    subtopicId,
    userId,
  }) => {
    const questions = await LessonGeneratedQuestion.find(
      this.asMongoFilter({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        deletedAt: null,
      })
    )
      .sort({ createdAt: 1 })
      .lean()

    return questions
  }
  readonly createLessonGeneratedQuestions: TrackerRepositoryContract['createLessonGeneratedQuestions'] = async ({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    questions,
  }) => {
    try {
      const docs = await LessonGeneratedQuestion.insertMany(
        questions.map((item) =>
          this.asMongoCreatePayload({
            trackerId: this.toObjectId(trackerId),
            subtopicId: this.toObjectId(subtopicId),
            userId: this.toObjectId(userId),
            lessonId: lessonId ? this.toObjectId(lessonId) : null,
            question: item.question,
            questionHash: item.questionHash,
            source: item.source || 'ai_generated',
            deletedAt: null,
          })
        ),
        {
          ordered: false,
        }
      )

      return docs
    } catch {
      const docs = await LessonGeneratedQuestion.find(
        this.asMongoFilter({
          trackerId: this.toObjectId(trackerId),
          subtopicId: this.toObjectId(subtopicId),
          userId: this.toObjectId(userId),
          questionHash: {
            $in: questions.map((item) => item.questionHash),
          },
          deletedAt: null,
        })
      ).lean()

      return docs
    }
  }
  readonly findLessonQuestionSolution: TrackerRepositoryContract['findLessonQuestionSolution'] = async ({
    trackerId,
    subtopicId,
    userId,
    questionHash,
  }) => {
    const solution = await LessonQuestionSolution.findOne(
      this.asMongoFilter({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        questionHash,
        deletedAt: null,
      })
    ).lean()

    return solution
  }
  readonly createLessonQuestionSolution: TrackerRepositoryContract['createLessonQuestionSolution'] = async ({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    question,
    questionHash,
    solution,
  }) => {
    const saved = await LessonQuestionSolution.findOneAndUpdate(
      this.asMongoFilter({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        questionHash,
        deletedAt: null,
      }),
      this.asMongoUpdate({
        $setOnInsert: {
          trackerId: this.toObjectId(trackerId),
          subtopicId: this.toObjectId(subtopicId),
          userId: this.toObjectId(userId),
          lessonId: lessonId ? this.toObjectId(lessonId) : null,
          question,
          questionHash,
          solution,
          deletedAt: null,
        },
      }),
      {
        upsert: true,
        new: true,
      }
    ).lean()

    return saved
  }
  readonly getLessonQuestionSolutionDoubts: TrackerRepositoryContract['getLessonQuestionSolutionDoubts'] = async ({
    trackerId,
    subtopicId,
    userId,
    questionHash,
  }) => {
    const doubts = await LessonQuestionSolutionDoubt.find(
      this.asMongoFilter({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        questionHash,
        deletedAt: null,
      })
    )
      .sort({ createdAt: 1 })
      .lean()

    return doubts
  }
  readonly createLessonQuestionSolutionDoubt: TrackerRepositoryContract['createLessonQuestionSolutionDoubt'] = async ({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    solutionId,
    question,
    questionHash,
    role,
    content,
  }) => {
    const doubt = await LessonQuestionSolutionDoubt.create(
      this.asMongoCreatePayload({
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
        lessonId: lessonId ? this.toObjectId(lessonId) : null,
        solutionId: solutionId ? this.toObjectId(solutionId) : null,
        question,
        questionHash,
        role,
        content,
        deletedAt: null,
      })
    )

    return doubt
  }
  readonly markMissingEvaluationTopicAsAdded: TrackerRepositoryContract['markMissingEvaluationTopicAsAdded'] = async ({
    evaluationJobId,
    topicIndex,
    addedSubtopicId,
    addedTopicId,
  }) => {
    const update: MongoUpdate = {
      [`outputData.evaluation.missingTopics.${topicIndex}.isAdded`]: true,
      [`outputData.evaluation.missingTopics.${topicIndex}.addedAt`]: new Date(),
    }
    if (addedSubtopicId) {
      update[`outputData.evaluation.missingTopics.${topicIndex}.addedSubtopicId`] = addedSubtopicId
    }
    if (addedTopicId) {
      update[`outputData.evaluation.missingTopics.${topicIndex}.addedTopicId`] = addedTopicId
    }
    return AIGenerationJob.findByIdAndUpdate(
      this.toObjectId(evaluationJobId),
      this.asMongoUpdate({ $set: update }),
      { returnDocument: 'after' }
    )
  }
  readonly findGeneratedLessonBySubtopic: TrackerRepositoryContract['findGeneratedLessonBySubtopic'] = async ({ trackerId, subtopicId, userId }) => {
    const tracker = await Tracker.findOne(
      this.asMongoFilter({ _id: this.toObjectId(trackerId), ownerId: this.toObjectId(userId), deletedAt: null })
    ).lean()
    if (!tracker) return null

    const lesson = await TrackerLesson.findOne(
      this.asMongoFilter({ trackerId: this.toObjectId(trackerId), subtopicId: this.toObjectId(subtopicId) })
    ).lean()
    if (!lesson?.generatedLesson) return null

    return lesson.generatedLesson
  }
  readonly getTopicsWithUserProgress: TrackerRepositoryContract['getTopicsWithUserProgress'] = async ({ trackerId, userId }) => {
    const trackerObjId = this.toObjectId(trackerId)
    const userObjId = this.toObjectId(userId)

    const [topics, userProgress] = await Promise.all([
      TrackerTopic.find(
        this.asMongoFilter({ trackerId: trackerObjId, deletedAt: null })
      ).sort({ order: 1 }).lean(),
      UserTopicProgress.find(
        this.asMongoFilter({ userId: userObjId, trackerId: trackerObjId })
      ).lean(),
    ])

    const progressMap = new Map(
      userProgress.map((p) => [p.topicId.toString(), p])
    )

    return topics.map((topic) => {
      const progress = progressMap.get(topic._id.toString())
      return {
        ...topic,
        status: progress?.status ?? 'active',
        progressPercent: progress?.progressPercent ?? 0,
      }
    }) as TopicWithProgressRecord[]
  }
  readonly clearLessonChatMessages: TrackerRepositoryContract['clearLessonChatMessages'] = async ({
  trackerId,
  subtopicId,
  userId,
}) => {
  return LessonChatMessage.updateMany(
    this.asMongoFilter({
      trackerId: this.toObjectId(trackerId),
      subtopicId: this.toObjectId(subtopicId),
      userId: this.toObjectId(userId),
      deletedAt: null,
    }),
    this.asMongoUpdate({
      $set: {
        deletedAt: new Date(),
      },
    })
  )
}

  readonly clearLessonQuestionSolutionDoubts: TrackerRepositoryContract['clearLessonQuestionSolutionDoubts'] = async ({
  trackerId,
  subtopicId,
  userId,
  questionHash,
}) => {
  return LessonQuestionSolutionDoubt.updateMany(
    this.asMongoFilter({
      trackerId: this.toObjectId(trackerId),
      subtopicId: this.toObjectId(subtopicId),
      userId: this.toObjectId(userId),
      questionHash,
      deletedAt: null,
    }),
    this.asMongoUpdate({
      $set: {
        deletedAt: new Date(),
      },
    })
  )
}

  readonly findLessonVisualization: TrackerRepositoryContract['findLessonVisualization'] = async ({ trackerId, subtopicId, userId }) => {
  const doc = await LessonVisualization.findOne(
    this.asMongoFilter({
      trackerId: this.toObjectId(trackerId),
      subtopicId: this.toObjectId(subtopicId),
      userId: this.toObjectId(userId),
      deletedAt: null,
    })
  ).lean()
 
  if (!doc) return null
 
  return {
    html: doc.html as string,
    visualTitle: doc.visualTitle as string,
    visualDescription: doc.visualDescription as string,
  }
}

  readonly saveLessonVisualization: TrackerRepositoryContract['saveLessonVisualization'] = async ({
  trackerId,
  subtopicId,
  userId,
  lessonId,
  html,
  visualTitle,
  visualDescription,
}) => {
  return LessonVisualization.findOneAndUpdate(
    this.asMongoFilter({
      trackerId: this.toObjectId(trackerId),
      subtopicId: this.toObjectId(subtopicId),
      userId: this.toObjectId(userId),
    }),
    this.asMongoUpdate({
      $set: {
        lessonId: lessonId ? this.toObjectId(lessonId) : null,
        html,
        visualTitle,
        visualDescription,
        deletedAt: null,
      },
      $setOnInsert: {
        trackerId: this.toObjectId(trackerId),
        subtopicId: this.toObjectId(subtopicId),
        userId: this.toObjectId(userId),
      },
    }),
    {
      upsert: true,
      returnDocument: 'after',
    }
  )
}
}

export const mongoTrackerRepository = new MongoTrackerRepository()
