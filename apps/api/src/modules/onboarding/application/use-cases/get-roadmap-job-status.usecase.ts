import type { OnboardingAIJobQueryRepositoryContract } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { GetJobStatusResult } from '../dtos/onboarding.dto'
import { OnboardingApplicationError } from '../errors/onboarding-application.error'
import type { OnboardingMapperContract } from '../mappers/onboarding.mapper'
import type { OnboardingJobOutputReaderServiceContract } from '../services/onboarding-job-output-reader.service'

export class GetRoadmapJobStatusUseCase {
  constructor(
    private readonly _onboardingRepository: OnboardingAIJobQueryRepositoryContract,
    private readonly _onboardingMapper: OnboardingMapperContract,
    private readonly _onboardingJobOutputReader: OnboardingJobOutputReaderServiceContract,
  ) {}

  async execute(
    jobId: string,
    userId: string,
  ): Promise<GetJobStatusResult> {
    const job = await this._onboardingRepository.getJobById(jobId)

    if (!job) {
      throw OnboardingApplicationError.notFound('Job not found')
    }

    if (!job.belongsTo(userId)) {
      throw OnboardingApplicationError.forbidden()
    }

    const steps = await this._onboardingRepository.getJobSteps(jobId)
    const trackerId = this._onboardingJobOutputReader.getTrackerId(
      job.outputData,
    )

    return this._onboardingMapper.toJobStatusDto(job, steps, trackerId)
  }
}
