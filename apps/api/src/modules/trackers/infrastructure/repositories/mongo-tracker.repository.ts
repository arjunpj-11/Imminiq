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

import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
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

const toObjectId = (value: string) => new Types.ObjectId(value)
const asMongoFilter = (query: MongoQuery) => query as never
const asMongoUpdate = (update: Record<string, unknown>) => update as never
const asMongoCreatePayload = (payload: Record<string, unknown>) => payload as never

const buildTrackerSort = (
  sortBy: TrackerListFilter['sortBy']
): Record<string, MongoSortOrder> => {
  if (sortBy === 'createdAt') return { createdAt: -1 }
  if (sortBy === 'progress') return { progressPercent: -1, lastActiveAt: -1 }
  if (sortBy === 'title') return { title: 1 }
  return { lastActiveAt: -1, updatedAt: -1 }
}

type StreakIntensityLevel = 'none' | 'low' | 'medium' | 'high'

const getUtcDayStart = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

const getPreviousUtcDayStart = (date: Date) => {
  const previous = new Date(date)
  previous.setUTCDate(previous.getUTCDate() - 1)
  return previous
}

const getIntensityLevel = (activityCount: number): StreakIntensityLevel => {
  if (activityCount <= 0) return 'none'
  if (activityCount < 3) return 'low'
  if (activityCount < 6) return 'medium'
  return 'high'
}

const updateUserStreakAfterTrackerActivity = async ({
  userObjId,
  trackerObjId,
  subtopicObjId,
}: {
  userObjId: Types.ObjectId
  trackerObjId: Types.ObjectId
  subtopicObjId: Types.ObjectId
}) => {
  const todayStart = getUtcDayStart()
  const yesterdayStart = getPreviousUtcDayStart(todayStart)
  const heatmapKey = todayStart.toISOString().slice(0, 10)
  const source = `tracker:${trackerObjId.toString()}:subtopic:${subtopicObjId.toString()}`

  const existingToday = await StreakHistory.findOne(
    asMongoFilter({
      userId: userObjId,
      date: todayStart,
      deletedAt: null,
    })
  ).lean()

  const yesterdayHistory = await StreakHistory.findOne(
    asMongoFilter({
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
    asMongoFilter({
      userId: userObjId,
      date: todayStart,
      deletedAt: null,
    }),
    asMongoUpdate({
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
  const intensityLevel = getIntensityLevel(activityCount)

  await StreakHistory.findOneAndUpdate(
    asMongoFilter({
      userId: userObjId,
      date: todayStart,
      deletedAt: null,
    }),
    asMongoUpdate({
      $set: {
        intensityLevel,
        streakDay,
      },
    })
  )

  const [totalActiveDays, totalFreezeUsed, latestSnapshot] = await Promise.all([
    StreakHistory.countDocuments(
      asMongoFilter({
        userId: userObjId,
        deletedAt: null,
        activityCount: { $gt: 0 },
      })
    ),
    StreakHistory.countDocuments(
      asMongoFilter({
        userId: userObjId,
        deletedAt: null,
        isFrozen: true,
      })
    ),
    StreakSnapshot.findOne(
      asMongoFilter({
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
    asMongoFilter({
      userId: userObjId,
      snapshotDate: todayStart,
      deletedAt: null,
    }),
    asMongoUpdate({
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
// ─── Repository ───────────────────────────────────────────────────────────────

export const mongoTrackerRepository: TrackerRepository = {

  // ─── Tracker CRUD ──────────────────────────────────────────────────────────

  hasAnyTrackerForUser: async (userId) => {
    const tracker = await Tracker.exists(
      asMongoFilter({ ownerId: toObjectId(userId), deletedAt: null })
    )
    return Boolean(tracker)
  },

  getTrackerSummary: async (userId) => {
    const ownerId = toObjectId(userId)
    const base: MongoQuery = { ownerId, deletedAt: null }

    const [total, active, completed, published, progressAgg] = await Promise.all([
      Tracker.countDocuments(asMongoFilter(base)),
      Tracker.countDocuments(asMongoFilter({ ...base, status: 'active' })),
      Tracker.countDocuments(asMongoFilter({ ...base, status: 'completed' })),
      Tracker.countDocuments(
        asMongoFilter({ ...base, visibility: 'public', publishedAt: { $ne: null } })
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
  },

  listOwnedTrackers: async ({ userId, status = 'all', domain = 'all', sortBy = 'lastActive', page, limit }) => {
    const query: MongoQuery = { ownerId: toObjectId(userId), deletedAt: null }
    if (status !== 'all') query.status = status
    if (domain !== 'all') query.domain = domain

    const skip = (page - 1) * limit
    const [trackers, total] = await Promise.all([
      Tracker.find(asMongoFilter(query)).sort(buildTrackerSort(sortBy)).skip(skip).limit(limit).lean(),
      Tracker.countDocuments(asMongoFilter(query)),
    ])

    return {
      trackers: trackers as TrackerRecord[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  createTracker: async (data: CreateTrackerInput) => {
    const tracker = await Tracker.create(asMongoCreatePayload({
      ownerId: toObjectId(data.userId),
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
      totalTimeSpentMinutes: 0,
      lastActiveAt: new Date(),
      publishedAt: null,
      completedAt: null,
      deletedAt: null,
    }))
    return tracker as TrackerRecord
  },

  updateOwnedTracker: async (data: UpdateTrackerInput) => {
    const update: MongoUpdate = {}
    if (data.title !== undefined) update.title = data.title
    if (data.description !== undefined) update.description = data.description
    if (data.domain !== undefined) update.domain = data.domain
    if (data.goal !== undefined) update.goal = data.goal
    if (data.level !== undefined) update.level = data.level

    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter({ _id: toObjectId(data.trackerId), ownerId: toObjectId(data.userId), deletedAt: null }),
      asMongoUpdate({ $set: update }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  },

  softDeleteOwnedTracker: async ({ trackerId, userId }) => {
    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter({ _id: toObjectId(trackerId), ownerId: toObjectId(userId), deletedAt: null }),
      asMongoUpdate({ $set: { deletedAt: new Date() } }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  },

  findOwnedTrackerById: async (trackerId, userId) => {
    const tracker = await Tracker.findOne(
      asMongoFilter({ _id: toObjectId(trackerId), ownerId: toObjectId(userId), deletedAt: null })
    )
    return tracker as TrackerRecord | null
  },

  archiveOwnedTracker: async ({ trackerId, userId }) => {
    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter({ _id: toObjectId(trackerId), ownerId: toObjectId(userId), deletedAt: null }),
      asMongoUpdate({ $set: { status: 'archived' } }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  },

  restoreOwnedTracker: async ({ trackerId, userId }) => {
    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter({ _id: toObjectId(trackerId), ownerId: toObjectId(userId), deletedAt: null }),
      asMongoUpdate({ $set: { status: 'active' } }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  },

  publishOwnedTracker: async ({ trackerId, userId }) => {
    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter({ _id: toObjectId(trackerId), ownerId: toObjectId(userId), deletedAt: null }),
      asMongoUpdate({ $set: { visibility: 'public', publishedAt: new Date() } }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  },

  unpublishOwnedTracker: async ({ trackerId, userId }) => {
    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter({ _id: toObjectId(trackerId), ownerId: toObjectId(userId), deletedAt: null }),
      asMongoUpdate({ $set: { visibility: 'private', publishedAt: null } }),
      { returnDocument: 'after' }
    )
    return tracker as TrackerRecord | null
  },

  // ─── Topics & Subtopics (content) ──────────────────────────────────────────

  findEvaluationJobById: async (evaluationJobId, userId) => {
    const job = await AIGenerationJob.findOne(
      asMongoFilter({ _id: toObjectId(evaluationJobId), userId: toObjectId(userId), jobType: 'evaluation' })
    )
    return job as EvaluationJobRecord | null
  },

  getTopicsForTracker: async (trackerId) => {
    const topics = await TrackerTopic.find(
      asMongoFilter({ trackerId: toObjectId(trackerId), deletedAt: null })
    ).sort({ order: 1 })
    return topics as TrackerTopicRecord[]
  },

  // Content only — no progress fields
  getSubtopicsForTracker: async (trackerId) => {
    const subtopics = await TrackerSubtopic.find(
      asMongoFilter({ trackerId: toObjectId(trackerId), deletedAt: null })
    ).sort({ depth: 1, order: 1 })
    return subtopics as TrackerSubtopicRecord[]
  },

  // Content merged with this user's per-user progress
  getSubtopicsWithUserProgress: async ({ trackerId, userId }) => {
    const trackerObjId = toObjectId(trackerId)
    const userObjId = toObjectId(userId)

    const [subtopics, userProgress] = await Promise.all([
      TrackerSubtopic.find(
        asMongoFilter({ trackerId: trackerObjId, deletedAt: null })
      ).sort({ depth: 1, order: 1 }).lean(),
      UserSubtopicProgress.find(
        asMongoFilter({ userId: userObjId, trackerId: trackerObjId })
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
        timeSpentMinutes: progress?.timeSpentMinutes ?? 0,
        completedAt: progress?.completedAt ?? null,
      } as SubtopicWithProgressRecord
    })
  },

  getSubtopicById: async ({ trackerId, subtopicId }) => {
    const subtopic = await TrackerSubtopic.findOne(
      asMongoFilter({ _id: toObjectId(subtopicId), trackerId: toObjectId(trackerId), deletedAt: null })
    )
    return subtopic as TrackerSubtopicRecord | null
  },

  findLastTopicForTracker: async (trackerId) => {
    const topic = await TrackerTopic.findOne(
      asMongoFilter({ trackerId: toObjectId(trackerId), deletedAt: null })
    ).sort({ order: -1 })
    return topic as LastTopicRecord | null
  },

  shiftTopicOrdersFrom: async ({ trackerId, fromOrder }) => {
    return TrackerTopic.updateMany(
      asMongoFilter({ trackerId: toObjectId(trackerId), order: { $gte: fromOrder }, deletedAt: null }),
      asMongoUpdate({ $inc: { order: 1 } })
    )
  },

  createTrackerTopic: async (data: CreateTrackerTopicInput) => {
    const topic = await TrackerTopic.create(asMongoCreatePayload({
      trackerId: toObjectId(data.trackerId),
      title: data.title,
      description: data.description,
      order: data.order,
      estimatedHours: 0,
      deletedAt: null,
    }))
    return topic as CreatedTrackerTopicRecord
  },

  findLastSiblingSubtopic: async ({ topicId, parentSubtopicId }) => {
    const subtopic = await TrackerSubtopic.findOne(
      asMongoFilter({
        topicId: toObjectId(topicId),
        parentSubtopicId: parentSubtopicId ? toObjectId(parentSubtopicId) : null,
        deletedAt: null,
      })
    ).sort({ order: -1 })
    return subtopic as LastSiblingSubtopicRecord | null
  },

  createTrackerSubtopic: async (data: CreateTrackerSubtopicInput) => {
    const subtopic = await TrackerSubtopic.create(asMongoCreatePayload({
      trackerId: toObjectId(data.trackerId),
      topicId: toObjectId(data.topicId),
      parentSubtopicId: data.parentSubtopicId ? toObjectId(data.parentSubtopicId) : null,
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
  },

  incrementTrackerTopicsCount: async (trackerId) => {
    return Tracker.findByIdAndUpdate(
      toObjectId(trackerId),
      asMongoUpdate({ $inc: { topicsCount: 1 } }),
      { returnDocument: 'after' }
    )
  },

  incrementTrackerSubtopicsCount: async (trackerId) => {
    return Tracker.findByIdAndUpdate(
      toObjectId(trackerId),
      asMongoUpdate({ $inc: { subtopicsCount: 1 } }),
      { returnDocument: 'after' }
    )
  },

  // ─── User Progress ──────────────────────────────────────────────────────────

  ensureUserProgressInitialized: async ({ userId, trackerId }) => {
    const userObjId = toObjectId(userId)
    const trackerObjId = toObjectId(trackerId)

    const existing = await UserSubtopicProgress.findOne(
      asMongoFilter({ userId: userObjId, trackerId: trackerObjId })
    )
    if (existing) return

    const [topics, subtopics] = await Promise.all([
      TrackerTopic.find(
        asMongoFilter({ trackerId: trackerObjId, deletedAt: null })
      ).sort({ order: 1 }).lean(),
      TrackerSubtopic.find(
        asMongoFilter({ trackerId: trackerObjId, deletedAt: null })
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
          timeSpentMinutes: 0,
          completedAt: null,
        }))
      )
    }

    await TrackerProgress.findOneAndUpdate(
      asMongoFilter({ userId: userObjId, trackerId: trackerObjId }),
      asMongoUpdate({
        $setOnInsert: {
          userId: userObjId,
          trackerId: trackerObjId,
          totalTopics: topics.length,
          completedTopics: 0,
          totalSubtopics: subtopics.length,
          completedSubtopics: 0,
          completionPercentage: 0,
          timeSpentMinutes: 0,
          lastStudiedAt: null,
          startedAt: new Date(),
          completedAt: null,
        },
      }),
      { upsert: true }
    )
  },

  getUserSubtopicsProgress: async ({ userId, trackerId }) => {
    const docs = await UserSubtopicProgress.find(
      asMongoFilter({ userId: toObjectId(userId), trackerId: toObjectId(trackerId) })
    ).lean()
    return docs as UserSubtopicProgressRecord[]
  },

  getUserTopicsProgress: async ({ userId, trackerId }) => {
    const docs = await UserTopicProgress.find(
      asMongoFilter({ userId: toObjectId(userId), trackerId: toObjectId(trackerId) })
    ).lean()
    return docs as UserTopicProgressRecord[]
  },

 updateSubtopicProgress: async ({
  trackerId,
  subtopicId,
  userId,
  status,
  timeSpentMinutes = 0,
}: UpdateSubtopicProgressInput) => {
  const userObjId = toObjectId(userId)
  const subtopicObjId = toObjectId(subtopicId)
  const trackerObjId = toObjectId(trackerId)

  const subtopic = await TrackerSubtopic.findOne(
    asMongoFilter({
      _id: subtopicObjId,
      trackerId: trackerObjId,
      deletedAt: null,
    })
  ).lean()

  if (!subtopic) return null

  const now = new Date()

  const previousProgress = await UserSubtopicProgress.findOne(
    asMongoFilter({
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
    asMongoFilter({
      userId: userObjId,
      trackerId: trackerObjId,
      subtopicId: subtopicObjId,
    }),
    asMongoUpdate({
      $setOnInsert: {
        userId: userObjId,
        trackerId: trackerObjId,
        topicId: subtopic.topicId,
        subtopicId: subtopicObjId,
      },
      $set: progressUpdate,
      $inc: {
        timeSpentMinutes,
      },
    }),
    {
      returnDocument: 'after',
      upsert: true,
    }
  )

  const [totalSubtopics, completedSubtopics] = await Promise.all([
    TrackerSubtopic.countDocuments(
      asMongoFilter({
        trackerId: trackerObjId,
        deletedAt: null,
      })
    ),

    UserSubtopicProgress.countDocuments(
      asMongoFilter({
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
      asMongoUpdate({
        $set: {
          lastActiveAt: now,
        },
      })
    ),

    TrackerProgress.findOneAndUpdate(
      asMongoFilter({
        userId: userObjId,
        trackerId: trackerObjId,
      }),
      asMongoUpdate({
        $setOnInsert: {
          userId: userObjId,
          trackerId: trackerObjId,
        },
        $set: {
          lastStudiedAt: now,
          completedSubtopics,
          totalSubtopics,
          completionPercentage,
          status:
            completionPercentage >= 100
              ? 'completed'
              : completionPercentage > 0
                ? 'in_progress'
                : 'not_started',
        },
        $inc: {
          timeSpentMinutes,
        },
      }),
      {
        upsert: true,
        returnDocument: 'after',
      }
    ),

    updateUserStreakAfterTrackerActivity({
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
    timeSpentMinutes: userProgress?.timeSpentMinutes ?? 0,
    completedAt: userProgress?.completedAt ?? null,
  } as SubtopicWithProgressRecord
},

  unlockNextSubtopic: async ({
    trackerId,
    topicId,
    completedSubtopicOrder,
    userId,
  }) => {
    const trackerObjId = toObjectId(trackerId)
    const userObjId = toObjectId(userId)

    const nextSubtopic = await TrackerSubtopic.findOne(
      asMongoFilter({
        trackerId: trackerObjId,
        topicId: toObjectId(topicId),
        order: { $gt: completedSubtopicOrder },
        deletedAt: null,
      })
    ).sort({ order: 1 }).lean()

    if (!nextSubtopic) return null

    return UserSubtopicProgress.findOneAndUpdate(
      asMongoFilter({ userId: userObjId, subtopicId: nextSubtopic._id }),
      asMongoUpdate({ $set: { isUnlocked: true, status: 'available' } }),
      { returnDocument: 'after', upsert: true }
    )
  },

  checkAndCompleteParentSubtopic: async ({
    trackerId,
    topicId,
    parentSubtopicId,
    userId,
  }) => {
    const userObjId = toObjectId(userId)
    const trackerObjId = toObjectId(trackerId)
    const topicObjId = toObjectId(topicId)
    const parentObjId = toObjectId(parentSubtopicId)

    const allChildren = await TrackerSubtopic.find(
      asMongoFilter({
        trackerId: trackerObjId,
        topicId: topicObjId,
        parentSubtopicId: parentObjId,
        deletedAt: null,
      })
    ).lean()

    if (allChildren.length === 0) return null

    const childIds = allChildren.map((c) => c._id)
    const completedCount = await UserSubtopicProgress.countDocuments(
      asMongoFilter({
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
        asMongoFilter({ userId: userObjId, subtopicId: parentObjId }),
        asMongoUpdate({
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
      asMongoFilter({ userId: userObjId, subtopicId: parentObjId }),
      asMongoUpdate({
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
      asMongoFilter({
        trackerId: trackerObjId,
        topicId: topicObjId,
        parentSubtopicId: parentContent.parentSubtopicId ?? null,
        order: { $gt: parentContent.order },
        deletedAt: null,
      })
    ).sort({ order: 1 }).lean()

    if (nextSibling) {
      await UserSubtopicProgress.findOneAndUpdate(
        asMongoFilter({ userId: userObjId, subtopicId: nextSibling._id }),
        asMongoUpdate({ $set: { isUnlocked: true, status: 'available' } }),
        { upsert: true }
      )
    }

    return updatedParent
  },

  checkAndCompleteTopicAndUnlockNext: async ({
    trackerId,
    topicId,
    userId,
  }) => {
    const userObjId = toObjectId(userId)
    const trackerObjId = toObjectId(trackerId)
    const topicObjId = toObjectId(topicId)

    const allSubtopics = await TrackerSubtopic.find(
      asMongoFilter({ trackerId: trackerObjId, topicId: topicObjId, deletedAt: null })
    ).lean()

    if (allSubtopics.length === 0) return null

    const subtopicIds = allSubtopics.map((s) => s._id)
    const total = allSubtopics.length

    const completedCount = await UserSubtopicProgress.countDocuments(
      asMongoFilter({
        userId: userObjId,
        subtopicId: { $in: subtopicIds },
        status: 'completed',
      })
    )

    const progressPercent = Math.round((completedCount / total) * 100)

    if (completedCount < total) {
      await UserTopicProgress.findOneAndUpdate(
        asMongoFilter({ userId: userObjId, topicId: topicObjId }),
        asMongoUpdate({ $set: { progressPercent, status: 'active' } }),
        { upsert: true }
      )
      return null
    }

    const completedTopic = await UserTopicProgress.findOneAndUpdate(
      asMongoFilter({ userId: userObjId, topicId: topicObjId }),
      asMongoUpdate({
        $set: { status: 'completed', progressPercent: 100, completedAt: new Date() },
      }),
      { returnDocument: 'after', upsert: true }
    )

    const currentTopic = await TrackerTopic.findById(topicObjId).lean()
    if (!currentTopic) return completedTopic

    const nextTopic = await TrackerTopic.findOne(
      asMongoFilter({
        trackerId: trackerObjId,
        order: { $gt: currentTopic.order },
        deletedAt: null,
      })
    ).sort({ order: 1 }).lean()

    if (!nextTopic) return completedTopic

    await UserTopicProgress.findOneAndUpdate(
      asMongoFilter({ userId: userObjId, topicId: nextTopic._id }),
      asMongoUpdate({ $set: { status: 'active' } }),
      { upsert: true }
    )

    const firstSubtopic = await TrackerSubtopic.findOne(
      asMongoFilter({
        trackerId: trackerObjId,
        topicId: nextTopic._id,
        depth: 1,
        deletedAt: null,
      })
    ).sort({ order: 1 }).lean()

    if (firstSubtopic) {
      await UserSubtopicProgress.findOneAndUpdate(
        asMongoFilter({ userId: userObjId, subtopicId: firstSubtopic._id }),
        asMongoUpdate({ $set: { isUnlocked: true, status: 'available' } }),
        { upsert: true }
      )
    }

    return completedTopic
  },

  recomputeTrackerProgress: async (trackerId, userId) => {
    const userObjId = toObjectId(userId)
    const trackerObjId = toObjectId(trackerId)

    const [totalSubtopics, completedSubtopics, totalTopics, completedTopics] =
      await Promise.all([
        UserSubtopicProgress.countDocuments(
          asMongoFilter({ userId: userObjId, trackerId: trackerObjId })
        ),
        UserSubtopicProgress.countDocuments(
          asMongoFilter({ userId: userObjId, trackerId: trackerObjId, status: 'completed' })
        ),
        UserTopicProgress.countDocuments(
          asMongoFilter({ userId: userObjId, trackerId: trackerObjId })
        ),
        UserTopicProgress.countDocuments(
          asMongoFilter({ userId: userObjId, trackerId: trackerObjId, status: 'completed' })
        ),
      ])

    const completionPercentage =
      totalSubtopics === 0
        ? 0
        : Math.round((completedSubtopics / totalSubtopics) * 100)

    await Tracker.findByIdAndUpdate(
      trackerObjId,
      asMongoUpdate({
        $set: {
          progressPercent: completionPercentage,
          completedSubtopicsCount: completedSubtopics,
          lastActiveAt: new Date(),
          ...(completionPercentage === 100 ? { status: 'completed', completedAt: new Date() } : {}),
        },
      })
    )

    const progress = await TrackerProgress.findOneAndUpdate(
      asMongoFilter({ userId: userObjId, trackerId: trackerObjId }),
      asMongoUpdate({
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
  },

  // ─── Lessons ───────────────────────────────────────────────────────────────

  findLessonBySubtopicId: async ({ trackerId, subtopicId, userId }) => {
    const lesson = await TrackerLesson.findOne(
      asMongoFilter({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        deletedAt: null,
      })
    )
    return lesson as GeneratedTrackerLessonRecord | null
  },

  createLesson: async (data) => {
    const lesson = await TrackerLesson.create(asMongoCreatePayload({
      trackerId: toObjectId(data.trackerId),
      subtopicId: toObjectId(data.subtopicId),
      userId: toObjectId(data.userId),
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
  },
  getLessonChatMessages: async ({
    trackerId,
    subtopicId,
    userId,
    scope = 'lesson_doubt_chat',
    questionId = null,
  }) => {
    const messages = await LessonChatMessage.find(
      asMongoFilter({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        scope,
        questionId,
        deletedAt: null,
      })
    )
      .sort({ createdAt: 1 })
      .lean()

    return messages
  },

  createLessonChatMessage: async ({
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
      asMongoCreatePayload({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        lessonId: lessonId ? toObjectId(lessonId) : null,
        scope,
        questionId,
        role,
        content,
        deletedAt: null,
      })
    )

    return message
  },

  getLessonAnswerAttempts: async ({
    trackerId,
    subtopicId,
    userId,
    questionId = null,
  }) => {
    const attempts = await LessonAnswerAttempt.find(
      asMongoFilter({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        questionId,
        deletedAt: null,
      })
    )
      .sort({ createdAt: -1 })
      .lean()

    return attempts
  },

  createLessonAnswerAttempt: async ({
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
      asMongoFilter({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        questionId,
        deletedAt: null,
      })
    )

    const attempt = await LessonAnswerAttempt.create(
      asMongoCreatePayload({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        lessonId: lessonId ? toObjectId(lessonId) : null,
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
  },

  getLessonCodeSubmissions: async ({
    trackerId,
    subtopicId,
    userId,
    action,
  }) => {
    const query: MongoQuery = {
      trackerId: toObjectId(trackerId),
      subtopicId: toObjectId(subtopicId),
      userId: toObjectId(userId),
      deletedAt: null,
    }

    if (action) {
      query.action = action
    }

    const submissions = await LessonCodeSubmission.find(
      asMongoFilter(query)
    )
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return submissions
  },

  createLessonCodeSubmission: async ({
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
      asMongoCreatePayload({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        lessonId: lessonId ? toObjectId(lessonId) : null,
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
  },

    getLessonGeneratedQuestions: async ({
    trackerId,
    subtopicId,
    userId,
  }) => {
    const questions = await LessonGeneratedQuestion.find(
      asMongoFilter({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        deletedAt: null,
      })
    )
      .sort({ createdAt: 1 })
      .lean()

    return questions
  },

  createLessonGeneratedQuestions: async ({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    questions,
  }) => {
    try {
      const docs = await LessonGeneratedQuestion.insertMany(
        questions.map((item) =>
          asMongoCreatePayload({
            trackerId: toObjectId(trackerId),
            subtopicId: toObjectId(subtopicId),
            userId: toObjectId(userId),
            lessonId: lessonId ? toObjectId(lessonId) : null,
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
        asMongoFilter({
          trackerId: toObjectId(trackerId),
          subtopicId: toObjectId(subtopicId),
          userId: toObjectId(userId),
          questionHash: {
            $in: questions.map((item) => item.questionHash),
          },
          deletedAt: null,
        })
      ).lean()

      return docs
    }
  },

  findLessonQuestionSolution: async ({
    trackerId,
    subtopicId,
    userId,
    questionHash,
  }) => {
    const solution = await LessonQuestionSolution.findOne(
      asMongoFilter({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        questionHash,
        deletedAt: null,
      })
    ).lean()

    return solution
  },

  createLessonQuestionSolution: async ({
    trackerId,
    subtopicId,
    userId,
    lessonId,
    question,
    questionHash,
    solution,
  }) => {
    const saved = await LessonQuestionSolution.findOneAndUpdate(
      asMongoFilter({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        questionHash,
        deletedAt: null,
      }),
      asMongoUpdate({
        $setOnInsert: {
          trackerId: toObjectId(trackerId),
          subtopicId: toObjectId(subtopicId),
          userId: toObjectId(userId),
          lessonId: lessonId ? toObjectId(lessonId) : null,
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
  },

  getLessonQuestionSolutionDoubts: async ({
    trackerId,
    subtopicId,
    userId,
    questionHash,
  }) => {
    const doubts = await LessonQuestionSolutionDoubt.find(
      asMongoFilter({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        questionHash,
        deletedAt: null,
      })
    )
      .sort({ createdAt: 1 })
      .lean()

    return doubts
  },

  createLessonQuestionSolutionDoubt: async ({
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
      asMongoCreatePayload({
        trackerId: toObjectId(trackerId),
        subtopicId: toObjectId(subtopicId),
        userId: toObjectId(userId),
        lessonId: lessonId ? toObjectId(lessonId) : null,
        solutionId: solutionId ? toObjectId(solutionId) : null,
        question,
        questionHash,
        role,
        content,
        deletedAt: null,
      })
    )

    return doubt
  },

  markMissingEvaluationTopicAsAdded: async ({
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
      toObjectId(evaluationJobId),
      asMongoUpdate({ $set: update }),
      { returnDocument: 'after' }
    )
  },

  findGeneratedLessonBySubtopic: async ({ trackerId, subtopicId, userId }) => {
    const tracker = await Tracker.findOne(
      asMongoFilter({ _id: toObjectId(trackerId), ownerId: toObjectId(userId), deletedAt: null })
    ).lean()
    if (!tracker) return null

    const lesson = await TrackerLesson.findOne(
      asMongoFilter({ trackerId: toObjectId(trackerId), subtopicId: toObjectId(subtopicId) })
    ).lean()
    if (!lesson?.generatedLesson) return null

    return lesson.generatedLesson
  },

  getTopicsWithUserProgress: async ({ trackerId, userId }) => {
    const trackerObjId = toObjectId(trackerId)
    const userObjId = toObjectId(userId)

    const [topics, userProgress] = await Promise.all([
      TrackerTopic.find(
        asMongoFilter({ trackerId: trackerObjId, deletedAt: null })
      ).sort({ order: 1 }).lean(),
      UserTopicProgress.find(
        asMongoFilter({ userId: userObjId, trackerId: trackerObjId })
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
  },
  
}