import type { RoadmapLevel } from '../../domain/types/onboarding.types'

import { mongoOnboardingRepository } from '../../infrastructure/repositories/mongo-onboarding.repository'
import { bullMqAIJobQueueGateway } from '../../infrastructure/gateways/bullmq-ai-job-queue.gateway'

import { GetOnboardingStatusUseCase } from '../use-cases/get-onboarding-status.usecase'
import { SaveOnboardingStepOneUseCase } from '../use-cases/save-onboarding-step-one.usecase'
import { SaveOnboardingStepTwoUseCase } from '../use-cases/save-onboarding-step-two.usecase'
import { GenerateRoadmapUseCase } from '../use-cases/generate-roadmap.usecase'
import { GetRoadmapJobStatusUseCase } from '../use-cases/get-roadmap-job-status.usecase'
import { GetRoadmapJobResultUseCase } from '../use-cases/get-roadmap-job-result.usecase'
import { EvaluateRoadmapUseCase } from '../use-cases/evaluate-roadmap.usecase'
import { GetRoadmapEvaluationResultUseCase } from '../use-cases/get-roadmap-evaluation-result.usecase'

const getOnboardingStatusUseCase =
  new GetOnboardingStatusUseCase(
    mongoOnboardingRepository
  )

const saveOnboardingStepOneUseCase =
  new SaveOnboardingStepOneUseCase(
    mongoOnboardingRepository
  )

const saveOnboardingStepTwoUseCase =
  new SaveOnboardingStepTwoUseCase(
    mongoOnboardingRepository
  )

const generateRoadmapUseCase =
  new GenerateRoadmapUseCase(
    mongoOnboardingRepository,
    bullMqAIJobQueueGateway
  )

const getRoadmapJobStatusUseCase =
  new GetRoadmapJobStatusUseCase(
    mongoOnboardingRepository
  )

const getRoadmapJobResultUseCase =
  new GetRoadmapJobResultUseCase(
    mongoOnboardingRepository
  )

const evaluateRoadmapUseCase =
  new EvaluateRoadmapUseCase(
    mongoOnboardingRepository,
    bullMqAIJobQueueGateway
  )

const getRoadmapEvaluationResultUseCase =
  new GetRoadmapEvaluationResultUseCase(
    mongoOnboardingRepository
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
