import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerTopic } from '../../../../infrastructure/database/models/tracker-topic.model'
import { TrackerSubtopic } from '../../../../infrastructure/database/models/tracker-subtopic.model'
import { AIGenerationJob } from '../../../../infrastructure/database/models/ai-generation-job.model'

import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type {
  CreateTrackerSubtopicInput,
  CreatedTrackerSubtopicRecord,
  EvaluationJobRecord,
  LastSiblingSubtopicRecord,
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
