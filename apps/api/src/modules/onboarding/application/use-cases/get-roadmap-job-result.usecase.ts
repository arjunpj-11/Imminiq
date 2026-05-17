import { ApiError } from '../../../../shared/utils/ApiError'

import type { OnboardingRepository } from '../../domain/repositories/onboarding.repository.interface'
import type { RoadmapTreeResult } from '../../domain/types/onboarding.types'
import { getTrackerIdFromOutputData } from '../utils/onboarding-job-output.util'

export class GetRoadmapJobResultUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(
    jobId: string,
    userId: string
  ): Promise<RoadmapTreeResult> {
    const job =
      await this.onboardingRepository.getJobById(jobId)

    if (!job) {
      throw new ApiError(
        404,
        'Job not found',
        'NOT_FOUND'
      )
    }

    if (job.userId.toString() !== userId) {
      throw new ApiError(
        403,
        'Forbidden',
        'FORBIDDEN'
      )
    }

    if (job.jobType !== 'roadmap') {
      throw new ApiError(
        400,
        'This job is not a roadmap generation job',
        'INVALID_JOB_TYPE'
      )
    }

    if (job.status !== 'completed') {
      throw new ApiError(
        400,
        'Job not completed yet',
        'JOB_PENDING'
      )
    }

    const trackerId =
      getTrackerIdFromOutputData(job.outputData)

    if (!trackerId) {
      throw new ApiError(
        500,
        'Tracker not created',
        'SERVER_ERROR'
      )
    }

    const result =
      await this.onboardingRepository.getRoadmapTree(
        trackerId
      )

    if (!result.tracker) {
      throw new ApiError(
        404,
        'Generated tracker not found',
        'TRACKER_NOT_FOUND'
      )
    }

    return result
  }
}
