import type { IOnboardingAIJobQueryRepository } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { IGetJobStatusResultDTO } from '../dtos/onboarding.dto'
import { OnboardingApplicationError } from '../errors/onboarding-application.error'
import type { IOnboardingMapper } from '../mappers/onboarding.mapper'
import type { IOnboardingJobOutputReader } from '../services/onboarding-job-output-reader.service'

export class GetRoadmapJobStatusUseCase {
  constructor(
    private readonly _onboardingRepository: IOnboardingAIJobQueryRepository,
    private readonly _onboardingMapper: IOnboardingMapper,
    private readonly _onboardingJobOutputReader: IOnboardingJobOutputReader,
  ) {}

  async execute(
    jobId: string,
    userId: string,
  ): Promise<IGetJobStatusResultDTO> {
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
