import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerTopic } from '../../../../infrastructure/database/models/tracker-topic.model'
import { TrackerSubtopic } from '../../../../infrastructure/database/models/tracker-subtopic.model'
import { AIGenerationJob } from '../../../../infrastructure/database/models/ai-generation-job.model'

import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type {
  CreateTrackerTopicInput,
  CreateTrackerSubtopicInput,
  CreatedTrackerTopicRecord,
  CreatedTrackerSubtopicRecord,
  EvaluationJobRecord,
  LastSiblingSubtopicRecord,
  LastTopicRecord,
  TrackerRecord,
  TrackerSubtopicRecord,
  TrackerTopicRecord,
} from '../../domain/types/trackers.types'

export const mongoTrackerRepository: TrackerRepository = {
  hasAnyTrackerForUser: async (
    userId: string
  ): Promise<boolean> => {
    const tracker = await Tracker.exists({
      ownerId: userId,
      deletedAt: null,
    })

    return Boolean(tracker)
  },

  findOwnedTrackerById: async (
    trackerId: string,
    userId: string
  ): Promise<TrackerRecord | null> => {
    const tracker = await Tracker.findOne({
      _id: trackerId,
      ownerId: userId,
      deletedAt: null,
    })

    return tracker as TrackerRecord | null
  },

  findEvaluationJobById: async (
    evaluationJobId: string,
    userId: string
  ): Promise<EvaluationJobRecord | null> => {
    const evaluationJob = await AIGenerationJob.findOne({
      _id: evaluationJobId,
      userId,
      jobType: 'evaluation',
    })

    return evaluationJob as EvaluationJobRecord | null
  },

  getTopicsForTracker: async (
    trackerId: string
  ): Promise<TrackerTopicRecord[]> => {
    const topics = await TrackerTopic.find({
      trackerId,
      deletedAt: null,
    }).sort({
      order: 1,
    })

    return topics as TrackerTopicRecord[]
  },

  getSubtopicsForTracker: async (
    trackerId: string
  ): Promise<TrackerSubtopicRecord[]> => {
    const subtopics = await TrackerSubtopic.find({
      trackerId,
      deletedAt: null,
    }).sort({
      depth: 1,
      order: 1,
    })

    return subtopics as TrackerSubtopicRecord[]
  },

  findLastTopicForTracker: async (
    trackerId: string
  ): Promise<LastTopicRecord | null> => {
    const topic = await TrackerTopic.findOne({
      trackerId,
      deletedAt: null,
    }).sort({
      order: -1,
    })

    return topic as LastTopicRecord | null
  },

  shiftTopicOrdersFrom: async ({
    trackerId,
    fromOrder,
  }: {
    trackerId: string
    fromOrder: number
  }) => {
    return TrackerTopic.updateMany(
      {
        trackerId,
        order: {
          $gte: fromOrder,
        },
        deletedAt: null,
      },
      {
        $inc: {
          order: 1,
        },
      }
    )
  },

  createTrackerTopic: async (
    data: CreateTrackerTopicInput
  ): Promise<CreatedTrackerTopicRecord> => {
    const topic = await TrackerTopic.create({
      trackerId: data.trackerId,
      title: data.title,
      description: data.description,
      order: data.order,
      status: 'locked',
      estimatedHours: 0,
      progressPercent: 0,
    })

    return topic as CreatedTrackerTopicRecord
  },

  findLastSiblingSubtopic: async ({
    topicId,
    parentSubtopicId,
  }: {
    topicId: string
    parentSubtopicId: string | null
  }): Promise<LastSiblingSubtopicRecord | null> => {
    const subtopic = await TrackerSubtopic.findOne({
      topicId,
      parentSubtopicId,
      deletedAt: null,
    }).sort({
      order: -1,
    })

    return subtopic as LastSiblingSubtopicRecord | null
  },

  createTrackerSubtopic: async (
    data: CreateTrackerSubtopicInput
  ): Promise<CreatedTrackerSubtopicRecord> => {
    const subtopic = await TrackerSubtopic.create({
      trackerId: data.trackerId,
      topicId: data.topicId,
      parentSubtopicId: data.parentSubtopicId,
      title: data.title,
      description: data.description,
      order: data.order,
      depth: data.depth,
      isLocked: true,
      estimatedMinutes: 0,
    })

    return subtopic as CreatedTrackerSubtopicRecord
  },

  incrementTrackerTopicsCount: async (
    trackerId: string
  ) => {
    return Tracker.findByIdAndUpdate(
      trackerId,
      {
        $inc: {
          topicsCount: 1,
        },
      },
      {
        returnDocument: 'after',
      }
    )
  },

  incrementTrackerSubtopicsCount: async (
    trackerId: string
  ) => {
    return Tracker.findByIdAndUpdate(
      trackerId,
      {
        $inc: {
          subtopicsCount: 1,
        },
      },
      {
        returnDocument: 'after',
      }
    )
  },

  markMissingEvaluationTopicAsAdded: async ({
    evaluationJobId,
    topicIndex,
    addedSubtopicId,
    addedTopicId,
  }: {
    evaluationJobId: string
    topicIndex: number
    addedSubtopicId?: string
    addedTopicId?: string
  }) => {
    const update: Record<string, unknown> = {
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
      evaluationJobId,
      {
        $set: update,
      },
      {
        returnDocument: 'after',
      }
    )
  },
}
