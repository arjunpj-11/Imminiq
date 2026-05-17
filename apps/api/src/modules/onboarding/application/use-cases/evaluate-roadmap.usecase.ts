import { ApiError } from '../../../../shared/utils/ApiError'

import type { AIJobQueueGateway } from '../../domain/gateways/ai-job-queue.gateway'
import type { OnboardingRepository } from '../../domain/repositories/onboarding.repository.interface'
import type { GenerateRoadmapResult } from '../../domain/types/onboarding.types'
import {
  ROADMAP_EVALUATION_STEPS,
} from '../constants/onboarding-job-steps'
import { getTrackerIdFromOutputData } from '../utils/onboarding-job-output.util'

export class EvaluateRoadmapUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly aiJobQueueGateway: AIJobQueueGateway
  ) {}

  async execute(
    roadmapJobId: string,
    userId: string
  ): Promise<GenerateRoadmapResult> {
    const roadmapJob =
      await this.onboardingRepository.getJobById(
        roadmapJobId
      )

    if (!roadmapJob) {
      throw new ApiError(
        404,
        'Roadmap job not found',
        'NOT_FOUND'
      )
    }

    if (roadmapJob.userId.toString() !== userId) {
      throw new ApiError(
        403,
        'Forbidden',
        'FORBIDDEN'
      )
    }

    if (roadmapJob.jobType !== 'roadmap') {
      throw new ApiError(
        400,
        'Only roadmap generation jobs can be evaluated',
        'INVALID_JOB_TYPE'
      )
    }

    if (roadmapJob.status !== 'completed') {
      throw new ApiError(
        400,
        'Roadmap generation is not completed yet',
        'JOB_PENDING'
      )
    }

    const trackerId =
      getTrackerIdFromOutputData(
        roadmapJob.outputData
      )

    if (!trackerId) {
      throw new ApiError(
        500,
        'Generated tracker is missing',
        'TRACKER_NOT_FOUND'
      )
    }

    const evaluationJob =
      await this.onboardingRepository.createEvaluationAIJob(
        userId,
        {
          sourceRoadmapJobId: roadmapJobId,
          trackerId,
        }
      )

    await this.onboardingRepository.createAIJobSteps(
      evaluationJob._id.toString(),
      ROADMAP_EVALUATION_STEPS
    )

    try {
      await this.aiJobQueueGateway.enqueueRoadmapEvaluation({
        jobId: evaluationJob._id.toString(),
        userId,
        trackerId,
        sourceRoadmapJobId: roadmapJobId,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to enqueue AI roadmap evaluation job'

      throw new ApiError(
        500,
        message,
        'AI_QUEUE_ERROR'
      )
    }

    return {
      jobId: evaluationJob._id.toString(),
    }
  }
}
