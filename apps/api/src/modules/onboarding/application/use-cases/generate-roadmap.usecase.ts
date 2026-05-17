import { ApiError } from '../../../../shared/utils/ApiError'

import type { AIJobQueueGateway } from '../../domain/gateways/ai-job-queue.gateway'
import type { OnboardingRepository } from '../../domain/repositories/onboarding.repository.interface'
import type {
  GenerateRoadmapResult,
  RoadmapLevel,
} from '../../domain/types/onboarding.types'
import {
  ROADMAP_GENERATION_STEPS,
} from '../constants/onboarding-job-steps'

export class GenerateRoadmapUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly aiJobQueueGateway: AIJobQueueGateway
  ) {}

  async execute(
    userId: string,
    topic: string,
    goal: string | undefined,
    level: RoadmapLevel
  ): Promise<GenerateRoadmapResult> {
    await this.onboardingRepository.saveStep1(
      userId,
      topic,
      goal
    )

    await this.onboardingRepository.saveStep2(
      userId,
      level
    )

    const aiJob =
      await this.onboardingRepository.createAIJob(
        userId,
        {
          topic,
          goal,
          level,
        }
      )

    await this.onboardingRepository.createAIJobSteps(
      aiJob._id.toString(),
      ROADMAP_GENERATION_STEPS
    )

    try {
      await this.aiJobQueueGateway.enqueueRoadmapGeneration({
        jobId: aiJob._id.toString(),
        userId,
        topic,
        goal,
        level,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to enqueue AI roadmap generation job'

      throw new ApiError(
        500,
        message,
        'AI_QUEUE_ERROR'
      )
    }

    return {
      jobId: aiJob._id.toString(),
    }
  }
}
