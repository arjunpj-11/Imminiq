import { ApiError } from '../../../../shared/utils/ApiError'

import type { OnboardingRepository } from '../../domain/repositories/onboarding.repository.interface'
import type { GetJobStatusResult } from '../../domain/types/onboarding.types'
import { getTrackerIdFromOutputData } from '../utils/onboarding-job-output.util'

export class GetRoadmapJobStatusUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingRepository
  ) {}

  async execute(
    jobId: string,
    userId: string
  ): Promise<GetJobStatusResult> {
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

    const steps =
      await this.onboardingRepository.getJobSteps(jobId)

    const activeStep =
      steps.find((step) => step.status === 'active') ||
      steps.find(
        (step) => step.stepNumber === job.currentStep
      )

    const completedSteps = steps.filter(
      (step) => step.status === 'completed'
    ).length

    return {
      jobId: job._id.toString(),

      jobType: job.jobType,

      status: job.status,

      currentStepNumber: job.currentStep,

      currentStep:
        activeStep?.stepLabel ||
        (job.status === 'completed'
          ? 'Complete'
          : 'Queued'),

      completedSteps,
      totalSteps: job.totalSteps,

      steps: steps.map((step) => ({
        stepNumber: step.stepNumber,
        stepLabel: step.stepLabel,
        status: step.status,
        startedAt: step.startedAt || null,
        completedAt: step.completedAt || null,
      })),

      trackerId: getTrackerIdFromOutputData(
        job.outputData
      ),

      errorMessage: job.errorMessage || null,
    }
  }
}
