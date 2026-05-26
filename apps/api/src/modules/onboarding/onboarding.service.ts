import type { RoadmapLevel } from './domain/types/onboarding.types'

import { mongoOnboardingRepository } from './infrastructure/repositories/mongo-onboarding.repository'
import { bullMqAIJobQueueGateway } from './infrastructure/gateways/bullmq-ai-job-queue.gateway'

import { GetOnboardingStatusUseCase } from './application/use-cases/get-onboarding-status.usecase'
import { SaveOnboardingStepOneUseCase } from './application/use-cases/save-onboarding-step-one.usecase'
import { SaveOnboardingStepTwoUseCase } from './application/use-cases/save-onboarding-step-two.usecase'
import { GenerateRoadmapUseCase } from './application/use-cases/generate-roadmap.usecase'
import { GetRoadmapJobStatusUseCase } from './application/use-cases/get-roadmap-job-status.usecase'
import { GetRoadmapJobResultUseCase } from './application/use-cases/get-roadmap-job-result.usecase'
import { EvaluateRoadmapUseCase } from './application/use-cases/evaluate-roadmap.usecase'
import { GetRoadmapEvaluationResultUseCase } from './application/use-cases/get-roadmap-evaluation-result.usecase'

const onboardingRepository = mongoOnboardingRepository
const aiJobQueueGateway = bullMqAIJobQueueGateway

const getOnboardingStatusUseCase =
  new GetOnboardingStatusUseCase(
    onboardingRepository
  )

const saveOnboardingStepOneUseCase =
  new SaveOnboardingStepOneUseCase(
    onboardingRepository
  )

const saveOnboardingStepTwoUseCase =
  new SaveOnboardingStepTwoUseCase(
    onboardingRepository
  )

const generateRoadmapUseCase =
  new GenerateRoadmapUseCase(
    onboardingRepository,
    aiJobQueueGateway
  )

const getRoadmapJobStatusUseCase =
  new GetRoadmapJobStatusUseCase(
    onboardingRepository
  )

const getRoadmapJobResultUseCase =
  new GetRoadmapJobResultUseCase(
    onboardingRepository
  )

const evaluateRoadmapUseCase =
  new EvaluateRoadmapUseCase(
    onboardingRepository,
    aiJobQueueGateway
  )

const getRoadmapEvaluationResultUseCase =
  new GetRoadmapEvaluationResultUseCase(
    onboardingRepository
  )

export const onboardingService = {
  getStatus: async (userId: string) => {
    return getOnboardingStatusUseCase.execute(userId)
  },

  saveStep1: async (
    userId: string,
    topic: string,
    goal?: string
  ) => {
    return saveOnboardingStepOneUseCase.execute(
      userId,
      topic,
      goal
    )
  },

  saveStep2: async (
    userId: string,
    level: RoadmapLevel
  ) => {
    return saveOnboardingStepTwoUseCase.execute(
      userId,
      level
    )
  },

  generateRoadmap: async (
    userId: string,
    topic: string,
    goal: string | undefined,
    level: RoadmapLevel
  ) => {
    return generateRoadmapUseCase.execute(
      userId,
      topic,
      goal,
      level
    )
  },

  getJobStatus: async (
    jobId: string,
    userId: string
  ) => {
    return getRoadmapJobStatusUseCase.execute(
      jobId,
      userId
    )
  },

  getJobResult: async (
    jobId: string,
    userId: string
  ) => {
    return getRoadmapJobResultUseCase.execute(
      jobId,
      userId
    )
  },

  evaluateRoadmap: async (
    roadmapJobId: string,
    userId: string
  ) => {
    return evaluateRoadmapUseCase.execute(
      roadmapJobId,
      userId
    )
  },

  getEvaluationResult: async (
    jobId: string,
    userId: string
  ) => {
    return getRoadmapEvaluationResultUseCase.execute(
      jobId,
      userId
    )
  },
}
