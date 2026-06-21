import type { OnboardingAIJobQueryRepositoryContract } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { GetJobStatusResult } from '../dtos/onboarding.dto'
import { OnboardingApplicationError } from '../errors/onboarding-application.error'
import type { OnboardingMapperContract } from '../mappers/onboarding.mapper'
import type { OnboardingJobOutputReaderServiceContract } from '../services/onboarding-job-output-reader.service'

export class GetRoadmapJobStatusUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingAIJobQueryRepositoryContract,
    private readonly onboardingMapper: OnboardingMapperContract,
    private readonly onboardingJobOutputReader: OnboardingJobOutputReaderServiceContract,
  ) {}

  async execute(
    jobId: string,
    userId: string,
  ): Promise<GetJobStatusResult> {
    const job = await this.onboardingRepository.getJobById(jobId)

    if (!job) {
      throw OnboardingApplicationError.notFound('Job not found')
    }

    if (!job.belongsTo(userId)) {
      throw OnboardingApplicationError.forbidden()
    }

    const steps = await this.onboardingRepository.getJobSteps(jobId)
    const trackerId = this.onboardingJobOutputReader.getTrackerId(
      job.outputData,
    )

    return this.onboardingMapper.toJobStatusDto(job, steps, trackerId)
  }
}
