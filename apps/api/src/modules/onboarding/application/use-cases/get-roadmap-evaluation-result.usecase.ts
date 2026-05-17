import { ApiError } from '../../../../shared/utils/ApiError'

import type { OnboardingRepository } from '../../domain/repositories/onboarding.repository.interface'
import type { GetEvaluationResult } from '../../domain/types/onboarding.types'
import {
  getEvaluationFromOutputData,
  getTrackerIdFromOutputData,
} from '../utils/onboarding-job-output.util'

export class GetRoadmapEvaluationResultUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(
    jobId: string,
    userId: string
  ): Promise<GetEvaluationResult> {
    const job =
      await this.onboardingRepository.getJobById(jobId)

    if (!job) {
      throw new ApiError(
        404,
        'Evaluation job not found',
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

    if (job.jobType !== 'evaluation') {
      throw new ApiError(
        400,
        'This job is not a roadmap evaluation job',
        'INVALID_JOB_TYPE'
      )
    }

    if (job.status !== 'completed') {
      throw new ApiError(
        400,
        'Evaluation is not completed yet',
        'JOB_PENDING'
      )
    }

    const evaluation =
      getEvaluationFromOutputData(job.outputData)

    if (!evaluation) {
      throw new ApiError(
        500,
        'Evaluation result is missing',
        'EVALUATION_RESULT_MISSING'
      )
    }

    return {
      jobId: job._id.toString(),

      trackerId: getTrackerIdFromOutputData(
        job.outputData
      ),

      evaluation,
    }
  }
}
