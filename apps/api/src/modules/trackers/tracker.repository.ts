// apps/api/src/modules/trackers/trackers.repository.ts

import { Tracker } from '../../infrastructure/database/models/tracker.model'
import { TrackerTopic } from '../../infrastructure/database/models/tracker-topic.model'
import { TrackerSubtopic } from '../../infrastructure/database/models/tracker-subtopic.model'
import { AIGenerationJob } from '../../infrastructure/database/models/ai-generation-job.model'

type CreateTrackerSubtopicInput = {
  trackerId: string
  topicId: string
  parentSubtopicId: string | null
  title: string
  description: string
  order: number
  depth: number
}

export const trackerRepository = {
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
  ) => {
    return Tracker.findOne({
      _id: trackerId,
      ownerId: userId,
      deletedAt: null,
    })
  },

  findEvaluationJobById: async (
    evaluationJobId: string,
    userId: string
  ) => {
    return AIGenerationJob.findOne({
      _id: evaluationJobId,
      userId,
      jobType: 'evaluation',
    })
  },

  getTopicsForTracker: async (
    trackerId: string
  ) => {
    return TrackerTopic.find({
      trackerId,
      deletedAt: null,
    }).sort({
      order: 1,
    })
  },

  getSubtopicsForTracker: async (
    trackerId: string
  ) => {
    return TrackerSubtopic.find({
      trackerId,
      deletedAt: null,
    }).sort({
      depth: 1,
      order: 1,
    })
  },

  findLastSiblingSubtopic: async ({
    topicId,
    parentSubtopicId,
  }: {
    topicId: string
    parentSubtopicId: string | null
  }) => {
    return TrackerSubtopic.findOne({
      topicId,
      parentSubtopicId,
      deletedAt: null,
    }).sort({
      order: -1,
    })
  },

  createTrackerSubtopic: async (
    data: CreateTrackerSubtopicInput
  ) => {
    return TrackerSubtopic.create({
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
        new: true,
      }
    )
  },

  markMissingEvaluationTopicAsAdded: async ({
    evaluationJobId,
    topicIndex,
    addedSubtopicId,
  }: {
    evaluationJobId: string
    topicIndex: number
    addedSubtopicId: string
  }) => {
    return AIGenerationJob.findByIdAndUpdate(
      evaluationJobId,
      {
        $set: {
          [`outputData.evaluation.missingTopics.${topicIndex}.isAdded`]:
            true,

          [`outputData.evaluation.missingTopics.${topicIndex}.addedSubtopicId`]:
            addedSubtopicId,

          [`outputData.evaluation.missingTopics.${topicIndex}.addedAt`]:
            new Date(),
        },
      },
      {
        new: true,
      }
    )
  },
}