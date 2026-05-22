// apps/api/src/modules/trackers/infrastructure/repositories/mongo-tracker.repository.ts

import { Types } from 'mongoose'

import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerTopic } from '../../../../infrastructure/database/models/tracker-topic.model'
import { TrackerSubtopic } from '../../../../infrastructure/database/models/tracker-subtopic.model'
import { AIGenerationJob } from '../../../../infrastructure/database/models/ai-generation-job.model'
import { TrackerLesson } from '../../../../infrastructure/database/models/tracker-lesson.model'


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
  TrackerListFilter,
  TrackerRecord,
  TrackerSubtopicRecord,
  TrackerTopicRecord,
  UpdateTrackerInput,
  UpdateSubtopicProgressInput,
} from '../../domain/types/trackers.types'

type MongoPrimitive =
  | string
  | number
  | boolean
  | null
  | Date
  | Types.ObjectId

type MongoOperatorValue = {
  $ne?: MongoPrimitive
  $gte?: string | number | Date
  $lte?: string | number | Date
  $in?: Array<string | number | Types.ObjectId>
}

type MongoValue =
  | MongoPrimitive
  | MongoPrimitive[]
  | MongoOperatorValue

type MongoQuery = Record<string, MongoValue>

type MongoUpdateValue =
  | MongoPrimitive
  | MongoPrimitive[]
  | Record<string, unknown>

type MongoUpdate = Record<string, MongoUpdateValue>

type MongoSortOrder = 1 | -1

const toObjectId = (value: string) => {
  return new Types.ObjectId(value)
}

const asMongoFilter = (query: MongoQuery) => {
  return query as never
}

const asMongoUpdate = (update: Record<string, unknown>) => {
  return update as never
}

const asMongoCreatePayload = (
  payload: Record<string, unknown>
) => {
  return payload as never
}

const buildTrackerSort = (
  sortBy: TrackerListFilter['sortBy']
): Record<string, MongoSortOrder> => {
  if (sortBy === 'createdAt') {
    return {
      createdAt: -1,
    }
  }

  if (sortBy === 'progress') {
    return {
      progressPercent: -1,
      lastActiveAt: -1,
    }
  }

  if (sortBy === 'title') {
    return {
      title: 1,
    }
  }

  return {
    lastActiveAt: -1,
    updatedAt: -1,
  }
}

export const mongoTrackerRepository: TrackerRepository = {
  hasAnyTrackerForUser: async (
    userId: string
  ): Promise<boolean> => {
    const query: MongoQuery = {
      ownerId: toObjectId(userId),
      deletedAt: null,
    }

    const tracker = await Tracker.exists(asMongoFilter(query))

    return Boolean(tracker)
  },

  getTrackerSummary: async (userId: string) => {
    const ownerId = toObjectId(userId)

    const baseQuery: MongoQuery = {
      ownerId,
      deletedAt: null,
    }

    const activeQuery: MongoQuery = {
      ownerId,
      status: 'active',
      deletedAt: null,
    }

    const completedQuery: MongoQuery = {
      ownerId,
      status: 'completed',
      deletedAt: null,
    }

    const publishedQuery: MongoQuery = {
      ownerId,
      visibility: 'public',
      publishedAt: {
        $ne: null,
      },
      deletedAt: null,
    }

    const [
      totalTrackers,
      activeTrackers,
      completedTrackers,
      publishedTrackers,
      progressAgg,
    ] = await Promise.all([
      Tracker.countDocuments(asMongoFilter(baseQuery)),

      Tracker.countDocuments(asMongoFilter(activeQuery)),

      Tracker.countDocuments(asMongoFilter(completedQuery)),

      Tracker.countDocuments(asMongoFilter(publishedQuery)),

      Tracker.aggregate([
        {
          $match: baseQuery,
        },
        {
          $group: {
            _id: null,
            averageProgress: {
              $avg: '$progressPercent',
            },
          },
        },
      ]),
    ])

    return {
      totalTrackers,
      activeTrackers,
      completedTrackers,
      publishedTrackers,
      averageProgress: Math.round(
        progressAgg[0]?.averageProgress || 0
      ),
    }
  },

  listOwnedTrackers: async ({
    userId,
    status = 'all',
    domain = 'all',
    sortBy = 'lastActive',
    page,
    limit,
  }: TrackerListFilter) => {
    const query: MongoQuery = {
      ownerId: toObjectId(userId),
      deletedAt: null,
    }

    if (status !== 'all') {
      query.status = status
    }

    if (domain !== 'all') {
      query.domain = domain
    }

    const skip = (page - 1) * limit

    const [trackers, total] = await Promise.all([
      Tracker.find(asMongoFilter(query))
        .sort(buildTrackerSort(sortBy))
        .skip(skip)
        .limit(limit)
        .lean(),

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

  createTracker: async (
    data: CreateTrackerInput
  ): Promise<TrackerRecord> => {
    const trackerPayload: Record<string, unknown> = {
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
    }

    const tracker = await Tracker.create(
      asMongoCreatePayload(trackerPayload)
    )

    return tracker as TrackerRecord
  },

  updateOwnedTracker: async (
    data: UpdateTrackerInput
  ): Promise<TrackerRecord | null> => {
    const update: MongoUpdate = {}

    if (data.title !== undefined) {
      update.title = data.title
    }

    if (data.description !== undefined) {
      update.description = data.description
    }

    if (data.domain !== undefined) {
      update.domain = data.domain
    }

    if (data.goal !== undefined) {
      update.goal = data.goal
    }

    if (data.level !== undefined) {
      update.level = data.level
    }

    const query: MongoQuery = {
      _id: toObjectId(data.trackerId),
      ownerId: toObjectId(data.userId),
      deletedAt: null,
    }

    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter(query),
      asMongoUpdate({
        $set: update,
      }),
      {
        returnDocument: 'after',
      }
    )

    return tracker as TrackerRecord | null
  },

  softDeleteOwnedTracker: async ({
    trackerId,
    userId,
  }) => {
    const query: MongoQuery = {
      _id: toObjectId(trackerId),
      ownerId: toObjectId(userId),
      deletedAt: null,
    }

    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter(query),
      asMongoUpdate({
        $set: {
          deletedAt: new Date(),
        },
      }),
      {
        returnDocument: 'after',
      }
    )

    return tracker as TrackerRecord | null
  },

  findOwnedTrackerById: async (
    trackerId: string,
    userId: string
  ): Promise<TrackerRecord | null> => {
    const query: MongoQuery = {
      _id: toObjectId(trackerId),
      ownerId: toObjectId(userId),
      deletedAt: null,
    }

    const tracker = await Tracker.findOne(asMongoFilter(query))

    return tracker as TrackerRecord | null
  },

  archiveOwnedTracker: async ({
    trackerId,
    userId,
  }) => {
    const query: MongoQuery = {
      _id: toObjectId(trackerId),
      ownerId: toObjectId(userId),
      deletedAt: null,
    }

    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter(query),
      asMongoUpdate({
        $set: {
          status: 'archived',
        },
      }),
      {
        returnDocument: 'after',
      }
    )

    return tracker as TrackerRecord | null
  },

  restoreOwnedTracker: async ({
    trackerId,
    userId,
  }) => {
    const query: MongoQuery = {
      _id: toObjectId(trackerId),
      ownerId: toObjectId(userId),
      deletedAt: null,
    }

    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter(query),
      asMongoUpdate({
        $set: {
          status: 'active',
        },
      }),
      {
        returnDocument: 'after',
      }
    )

    return tracker as TrackerRecord | null
  },

  publishOwnedTracker: async ({
    trackerId,
    userId,
  }) => {
    const query: MongoQuery = {
      _id: toObjectId(trackerId),
      ownerId: toObjectId(userId),
      deletedAt: null,
    }

    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter(query),
      asMongoUpdate({
        $set: {
          visibility: 'public',
          publishedAt: new Date(),
        },
      }),
      {
        returnDocument: 'after',
      }
    )

    return tracker as TrackerRecord | null
  },

  unpublishOwnedTracker: async ({
    trackerId,
    userId,
  }) => {
    const query: MongoQuery = {
      _id: toObjectId(trackerId),
      ownerId: toObjectId(userId),
      deletedAt: null,
    }

    const tracker = await Tracker.findOneAndUpdate(
      asMongoFilter(query),
      asMongoUpdate({
        $set: {
          visibility: 'private',
          publishedAt: null,
        },
      }),
      {
        returnDocument: 'after',
      }
    )

    return tracker as TrackerRecord | null
  },

  findEvaluationJobById: async (
    evaluationJobId: string,
    userId: string
  ): Promise<EvaluationJobRecord | null> => {
    const query: MongoQuery = {
      _id: toObjectId(evaluationJobId),
      userId: toObjectId(userId),
      jobType: 'evaluation',
    }

    const evaluationJob = await AIGenerationJob.findOne(
      asMongoFilter(query)
    )

    return evaluationJob as EvaluationJobRecord | null
  },

  getTopicsForTracker: async (
    trackerId: string
  ): Promise<TrackerTopicRecord[]> => {
    const query: MongoQuery = {
      trackerId: toObjectId(trackerId),
      deletedAt: null,
    }

    const topics = await TrackerTopic.find(
      asMongoFilter(query)
    ).sort({
      order: 1,
    })

    return topics as TrackerTopicRecord[]
  },

  getSubtopicsForTracker: async (
    trackerId: string
  ): Promise<TrackerSubtopicRecord[]> => {
    const query: MongoQuery = {
      trackerId: toObjectId(trackerId),
      deletedAt: null,
    }

    const subtopics = await TrackerSubtopic.find(
      asMongoFilter(query)
    ).sort({
      depth: 1,
      order: 1,
    })

    return subtopics as TrackerSubtopicRecord[]
  },

  getSubtopicById: async ({
    trackerId,
    subtopicId,
  }) => {
    const query: MongoQuery = {
      _id: toObjectId(subtopicId),
      trackerId: toObjectId(trackerId),
      deletedAt: null,
    }

    const subtopic = await TrackerSubtopic.findOne(
      asMongoFilter(query)
    )

    return subtopic as TrackerSubtopicRecord | null
  },

  findLastTopicForTracker: async (
    trackerId: string
  ): Promise<LastTopicRecord | null> => {
    const query: MongoQuery = {
      trackerId: toObjectId(trackerId),
      deletedAt: null,
    }

    const topic = await TrackerTopic.findOne(
      asMongoFilter(query)
    ).sort({
      order: -1,
    })

    return topic as LastTopicRecord | null
  },

  shiftTopicOrdersFrom: async ({
    trackerId,
    fromOrder,
  }) => {
    const query: MongoQuery = {
      trackerId: toObjectId(trackerId),
      order: {
        $gte: fromOrder,
      },
      deletedAt: null,
    }

    return TrackerTopic.updateMany(
      asMongoFilter(query),
      asMongoUpdate({
        $inc: {
          order: 1,
        },
      })
    )
  },

  createTrackerTopic: async (
    data: CreateTrackerTopicInput
  ): Promise<CreatedTrackerTopicRecord> => {
    const topicPayload: Record<string, unknown> = {
      trackerId: toObjectId(data.trackerId),
      title: data.title,
      description: data.description,
      order: data.order,
      status: 'available',
      estimatedHours: 0,
      progressPercent: 0,
      deletedAt: null,
    }

    const topic = await TrackerTopic.create(
      asMongoCreatePayload(topicPayload)
    )

    return topic as CreatedTrackerTopicRecord
  },

  findLastSiblingSubtopic: async ({
    topicId,
    parentSubtopicId,
  }) => {
    const query: MongoQuery = {
      topicId: toObjectId(topicId),
      parentSubtopicId: parentSubtopicId
        ? toObjectId(parentSubtopicId)
        : null,
      deletedAt: null,
    }

    const subtopic = await TrackerSubtopic.findOne(
      asMongoFilter(query)
    ).sort({
      order: -1,
    })

    return subtopic as LastSiblingSubtopicRecord | null
  },

  createTrackerSubtopic: async (
    data: CreateTrackerSubtopicInput
  ): Promise<CreatedTrackerSubtopicRecord> => {
    const subtopicPayload: Record<string, unknown> = {
      trackerId: toObjectId(data.trackerId),
      topicId: toObjectId(data.topicId),
      parentSubtopicId: data.parentSubtopicId
        ? toObjectId(data.parentSubtopicId)
        : null,
      title: data.title,
      description: data.description,
      order: data.order,
      depth: data.depth,
      status: data.depth === 1 ? 'available' : 'locked',
      isLocked: data.depth !== 1,
      estimatedMinutes: data.estimatedMinutes || 0,
      progressPercent: 0,
      timeSpentMinutes: 0,
      completedAt: null,
      deletedAt: null,
    }

    const subtopic = await TrackerSubtopic.create(
      asMongoCreatePayload(subtopicPayload)
    )

    return subtopic as CreatedTrackerSubtopicRecord
  },

  incrementTrackerTopicsCount: async (
    trackerId: string
  ) => {
    return Tracker.findByIdAndUpdate(
      toObjectId(trackerId),
      asMongoUpdate({
        $inc: {
          topicsCount: 1,
        },
      }),
      {
        returnDocument: 'after',
      }
    )
  },

  incrementTrackerSubtopicsCount: async (
    trackerId: string
  ) => {
    return Tracker.findByIdAndUpdate(
      toObjectId(trackerId),
      asMongoUpdate({
        $inc: {
          subtopicsCount: 1,
        },
      }),
      {
        returnDocument: 'after',
      }
    )
  },

  updateSubtopicProgress: async ({
    trackerId,
    subtopicId,
    status,
    timeSpentMinutes = 0,
  }: UpdateSubtopicProgressInput) => {
    const query: MongoQuery = {
      _id: toObjectId(subtopicId),
      trackerId: toObjectId(trackerId),
      deletedAt: null,
    }

    const update: MongoUpdate = {
      status,
      isLocked: false,
    }

    if (status === 'completed') {
      update.progressPercent = 100
      update.completedAt = new Date()
    }

    if (status === 'in_progress') {
      update.progressPercent = 50
    }

    const subtopic = await TrackerSubtopic.findOneAndUpdate(
      asMongoFilter(query),
      asMongoUpdate({
        $set: update,
        $inc: {
          timeSpentMinutes,
        },
      }),
      {
        returnDocument: 'after',
      }
    )

    await Tracker.findByIdAndUpdate(
      toObjectId(trackerId),
      asMongoUpdate({
        $set: {
          lastActiveAt: new Date(),
        },
        $inc: {
          totalTimeSpentMinutes: timeSpentMinutes,
        },
      })
    )

    return subtopic as TrackerSubtopicRecord | null
  },

  recomputeTrackerProgress: async (
    trackerId: string
  ) => {
    const trackerObjectId = toObjectId(trackerId)

    const baseQuery: MongoQuery = {
      trackerId: trackerObjectId,
      deletedAt: null,
    }

    const completedQuery: MongoQuery = {
      trackerId: trackerObjectId,
      status: 'completed',
      deletedAt: null,
    }

    const [totalSubtopics, completedSubtopics] =
      await Promise.all([
        TrackerSubtopic.countDocuments(
          asMongoFilter(baseQuery)
        ),

        TrackerSubtopic.countDocuments(
          asMongoFilter(completedQuery)
        ),
      ])

    const progressPercent =
      totalSubtopics === 0
        ? 0
        : Math.round(
            (completedSubtopics / totalSubtopics) * 100
          )

    const trackerStatus =
      totalSubtopics > 0 &&
      completedSubtopics === totalSubtopics
        ? 'completed'
        : 'active'

    const tracker = await Tracker.findByIdAndUpdate(
      trackerObjectId,
      asMongoUpdate({
        $set: {
          progressPercent,
          completedSubtopicsCount: completedSubtopics,
          status: trackerStatus,
          completedAt:
            trackerStatus === 'completed' ? new Date() : null,
          lastActiveAt: new Date(),
        },
      }),
      {
        returnDocument: 'after',
      }
    )

    return tracker as TrackerRecord | null
  },

  findLessonBySubtopicId: async ({
    trackerId,
    subtopicId,
    userId,
  }) => {
    const query: MongoQuery = {
      trackerId: toObjectId(trackerId),
      subtopicId: toObjectId(subtopicId),
      userId: toObjectId(userId),
      deletedAt: null,
    }

    const lesson = await TrackerLesson.findOne(
      asMongoFilter(query)
    )

    return lesson as GeneratedTrackerLessonRecord | null
  },

createLesson: async (data) => {
  const lessonPayload: Record<string, unknown> = {
    trackerId: toObjectId(data.trackerId),
    subtopicId: toObjectId(data.subtopicId),
    userId: toObjectId(data.userId),
    title: data.title,
    summary: data.summary,
    explanation: data.explanation,
    insight: data.insight,
    lessonType: data.lessonType,
    requiresCompiler: data.requiresCompiler,
    codeExample: data.codeExample,
    practiceTask: data.practiceTask,
    tags: data.tags,
    difficulty: data.difficulty,
    estimatedMinutes: data.estimatedMinutes,
    deletedAt: null,
  }

  const lesson = await TrackerLesson.create(
    asMongoCreatePayload(lessonPayload)
  )

  return lesson as GeneratedTrackerLessonRecord
},

  markMissingEvaluationTopicAsAdded: async ({
    evaluationJobId,
    topicIndex,
    addedSubtopicId,
    addedTopicId,
  }) => {
    const update: MongoUpdate = {
      [`outputData.evaluation.missingTopics.${topicIndex}.isAdded`]:
        true,

      [`outputData.evaluation.missingTopics.${topicIndex}.addedAt`]:
        new Date(),
    }

    if (addedSubtopicId) {
      update[
        `outputData.evaluation.missingTopics.${topicIndex}.addedSubtopicId`
      ] = addedSubtopicId
    }

    if (addedTopicId) {
      update[
        `outputData.evaluation.missingTopics.${topicIndex}.addedTopicId`
      ] = addedTopicId
    }

    return AIGenerationJob.findByIdAndUpdate(
      toObjectId(evaluationJobId),
      asMongoUpdate({
        $set: update,
      }),
      {
        returnDocument: 'after',
      }
    )
  },
  findGeneratedLessonBySubtopic: async ({
  trackerId,
  subtopicId,
  userId,
}: {
  trackerId: string
  subtopicId: string
  userId: string
}) => {
  const tracker = await Tracker.findOne({
    _id: trackerId,
    userId,
    deletedAt: null,
  }).lean()

  if (!tracker) return null

  const lesson = await TrackerLesson.findOne({
    trackerId,
    subtopicId,
  }).lean()

  if (!lesson?.generatedLesson) return null

  return lesson.generatedLesson
},
}