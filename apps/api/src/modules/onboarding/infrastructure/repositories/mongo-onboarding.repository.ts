import { OnboardingResponse } from '../../../../infrastructure/database/models/onboarding-response.model'
import { AIGenerationJob } from '../../../../infrastructure/database/models/ai-generation-job.model'
import { AIGenerationStep } from '../../../../infrastructure/database/models/ai-generation-step.model'
import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerTopic } from '../../../../infrastructure/database/models/tracker-topic.model'
import { TrackerSubtopic } from '../../../../infrastructure/database/models/tracker-subtopic.model'

import type { OnboardingRepository } from '../../domain/repositories/onboarding.repository.interface'
import type {
  AIGenerationJobRecord,
  AIGenerationStepRecord,
  EvaluationJobInput,
  OnboardingResponseRecord,
  RoadmapJobInput,
  RoadmapLevel,
  RoadmapTreeResult,
  SubtopicTreeNode,
  TrackerRecord,
} from '../../domain/types/onboarding.types'

type MaybeMongooseDocument<T> = T & {
  toObject?: () => T
}

const toPlainRecord = <T>(
  value: MaybeMongooseDocument<T>
): T => {
  return typeof value.toObject === 'function'
    ? value.toObject()
    : value
}

export const mongoOnboardingRepository: OnboardingRepository = {
  getStatus: async (userId: string) => {
    return OnboardingResponse.findOne({
      userId,
      deletedAt: null,
    }).lean<OnboardingResponseRecord>()
  },

  saveStep1: async (
    userId: string,
    topic: string,
    goal?: string
  ) => {
    return OnboardingResponse.findOneAndUpdate(
      { userId },
      {
        $set: {
          preparingFor: topic,
          goal: goal || '',
        },
        $max: {
          completedStep: 1,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean<OnboardingResponseRecord>()
  },

  saveStep2: async (
    userId: string,
    level: RoadmapLevel
  ) => {
    return OnboardingResponse.findOneAndUpdate(
      { userId },
      {
        $set: {
          currentLevel: level,
        },
        $max: {
          completedStep: 2,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean<OnboardingResponseRecord>()
  },

  markCompleted: async (userId: string) => {
    return OnboardingResponse.findOneAndUpdate(
      { userId },
      {
        $set: {
          isCompleted: true,
          completedStep: 2,
        },
      },
      {
        new: true,
      }
    ).lean<OnboardingResponseRecord>()
  },

  findActiveRoadmapJobForUser: async (
    userId: string
  ) => {
    return AIGenerationJob.findOne({
      userId,
      jobType: 'roadmap',
      status: {
        $in: ['pending', 'processing'],
      },
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .lean<AIGenerationJobRecord>()
  },

  findActiveEvaluationJobForRoadmap: async (
    userId: string,
    sourceRoadmapJobId: string
  ) => {
    return AIGenerationJob.findOne({
      userId,
      jobType: 'evaluation',
      'inputData.sourceRoadmapJobId': sourceRoadmapJobId,
      status: {
        $in: ['pending', 'processing'],
      },
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .lean<AIGenerationJobRecord>()
  },

  createAIJob: async (
    userId: string,
    inputData: RoadmapJobInput
  ) => {
    const aiJob = await AIGenerationJob.create({
      userId,
      jobType: 'roadmap',
      status: 'pending',
      inputData,
      totalSteps: 5,
      currentStep: 0,
    })

    return toPlainRecord(aiJob as unknown as MaybeMongooseDocument<AIGenerationJobRecord>)
  },

  createEvaluationAIJob: async (
    userId: string,
    inputData: EvaluationJobInput
  ) => {
    const aiJob = await AIGenerationJob.create({
      userId,
      jobType: 'evaluation',
      status: 'pending',
      inputData,
      totalSteps: 5,
      currentStep: 0,
    })

    return toPlainRecord(aiJob as unknown as MaybeMongooseDocument<AIGenerationJobRecord>)
  },

  createAIJobSteps: async (
    jobId: string,
    stepLabels: string[]
  ) => {
    return AIGenerationStep.insertMany(
      stepLabels.map((stepLabel, index) => ({
        jobId,
        stepNumber: index + 1,
        stepLabel,
        status: 'pending',
      }))
    )
  },

  getJobById: async (jobId: string) => {
    return AIGenerationJob.findById(jobId).lean<AIGenerationJobRecord>()
  },

  getJobSteps: async (jobId: string) => {
    return AIGenerationStep.find({ jobId })
      .sort({
        stepNumber: 1,
      })
      .lean<AIGenerationStepRecord[]>()
  },

  getRoadmapTree: async (
    trackerId: string
  ): Promise<RoadmapTreeResult> => {
    const tracker = await Tracker.findById(trackerId).lean<TrackerRecord>()

    const topics = await TrackerTopic.find({
      trackerId,
      deletedAt: null,
    })
      .sort({ order: 1 })
      .lean<Array<{
        _id: { toString(): string }
        title: string
        description: string
        order: number
      }>>()

    const subtopics = await TrackerSubtopic.find({
      trackerId,
      deletedAt: null,
    })
      .sort({
        depth: 1,
        order: 1,
      })
      .lean<Array<{
        _id: { toString(): string }
        topicId: { toString(): string }
        parentSubtopicId?: { toString(): string } | null
        title: string
        description: string
        order: number
        depth: number
      }>>()

    const subtopicMap = new Map<string, SubtopicTreeNode>()

    for (const subtopic of subtopics) {
      subtopicMap.set(subtopic._id.toString(), {
        _id: subtopic._id.toString(),
        title: subtopic.title,
        description: subtopic.description,
        order: subtopic.order,
        depth: subtopic.depth,
        children: [],
      })
    }

    const topicChildrenMap = new Map<
      string,
      SubtopicTreeNode[]
    >()

    for (const topic of topics) {
      topicChildrenMap.set(topic._id.toString(), [])
    }

    for (const subtopic of subtopics) {
      const currentNode = subtopicMap.get(
        subtopic._id.toString()
      )

      if (!currentNode) continue

      if (subtopic.parentSubtopicId) {
        const parentNode = subtopicMap.get(
          subtopic.parentSubtopicId.toString()
        )

        if (parentNode) {
          parentNode.children.push(currentNode)
        }

        continue
      }

      const rootChildren = topicChildrenMap.get(
        subtopic.topicId.toString()
      )

      if (rootChildren) {
        rootChildren.push(currentNode)
      }
    }

    const roadmapTopics = topics.map((topic) => ({
      _id: topic._id.toString(),
      title: topic.title,
      description: topic.description,
      order: topic.order,
      children:
        topicChildrenMap.get(topic._id.toString()) || [],
    }))

    return {
      tracker,
      topics: roadmapTopics,
    }
  },
}
