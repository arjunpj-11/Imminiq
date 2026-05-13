// apps/api/src/modules/onboarding/onboarding.repository.ts

import { OnboardingResponse } from '../../infrastructure/database/models/onboarding-response.model'
import { AIGenerationJob } from '../../infrastructure/database/models/ai-generation-job.model'
import { AIGenerationStep } from '../../infrastructure/database/models/ai-generation-step.model'
import { Tracker } from '../../infrastructure/database/models/tracker.model'
import { TrackerTopic } from '../../infrastructure/database/models/tracker-topic.model'
import { TrackerSubtopic } from '../../infrastructure/database/models/tracker-subtopic.model'

type RoadmapJobInput = {
  topic: string
  goal?: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

export type SubtopicTreeNode = {
  _id: string
  title: string
  description: string
  order: number
  depth: number
  children: SubtopicTreeNode[]
}

export const onboardingRepository = {
  getStatus: (userId: string) =>
    OnboardingResponse.findOne({
      userId,
      deletedAt: null,
    }),

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
    )
  },

  saveStep2: async (
    userId: string,
    level: 'beginner' | 'intermediate' | 'advanced'
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
    )
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
    )
  },

  createAIJob: async (
    userId: string,
    inputData: RoadmapJobInput
  ) => {
    return AIGenerationJob.create({
      userId,
      jobType: 'roadmap',
      status: 'pending',
      inputData,
      totalSteps: 5,
      currentStep: 0,
    })
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

  getJobById: (jobId: string) =>
    AIGenerationJob.findById(jobId),

  getJobSteps: (jobId: string) =>
    AIGenerationStep.find({ jobId }).sort({
      stepNumber: 1,
    }),

  getRoadmapTree: async (trackerId: string) => {
    const tracker = await Tracker.findById(trackerId)

    const topics = await TrackerTopic.find({
      trackerId,
      deletedAt: null,
    }).sort({ order: 1 })

    const subtopics = await TrackerSubtopic.find({
      trackerId,
      deletedAt: null,
    }).sort({
      depth: 1,
      order: 1,
    })

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