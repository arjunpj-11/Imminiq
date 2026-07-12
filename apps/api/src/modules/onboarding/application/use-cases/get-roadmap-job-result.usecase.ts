import type { IOnboardingAIJobQueryRepository } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { IOnboardingRoadmapRepository } from '../../domain/repositories/onboarding-roadmap.repository.interface'
import type { IRoadmapTreeResultDTO } from '../dtos/onboarding.dto'
import { OnboardingApplicationError } from '../errors/onboarding-application.error'
import type { IOnboardingMapper } from '../mappers/onboarding.mapper'
import type { IOnboardingJobOutputReader } from '../services/onboarding-job-output-reader.service'

type RoadmapJobResultRepository =
  IOnboardingAIJobQueryRepository &
  IOnboardingRoadmapRepository

export interface IGetRoadmapJobResultUseCase {
  execute(jobId: string, userId: string): Promise<IRoadmapTreeResultDTO>
}

export class GetRoadmapJobResultUseCase implements IGetRoadmapJobResultUseCase {
  constructor(
    private readonly _onboardingRepository: RoadmapJobResultRepository,
    private readonly _onboardingMapper: IOnboardingMapper,
    private readonly _onboardingJobOutputReader: IOnboardingJobOutputReader,
  ) {}

  async execute(
    jobId: string,
    userId: string,
  ): Promise<IRoadmapTreeResultDTO> {
    const job = await this._onboardingRepository.getJobById(jobId)

    if (!job) {
      throw OnboardingApplicationError.notFound('Job not found')
    }

    if (!job.belongsTo(userId)) {
      throw OnboardingApplicationError.forbidden()
    }

    if (!job.isRoadmapJob()) {
      throw OnboardingApplicationError.invalidJobType(
        'This job is not a roadmap generation job',
      )
    }

    if (!job.isCompleted()) {
      throw OnboardingApplicationError.jobPending('Job not completed yet')
    }

    const trackerId = this._onboardingJobOutputReader.getTrackerId(job.outputData)

    if (!trackerId) {
      throw OnboardingApplicationError.serverError('Tracker not created')
    }

    const result = await this._onboardingRepository.getRoadmapTree(trackerId)

    if (!result.tracker) {
      throw OnboardingApplicationError.trackerNotFound(
        'Generated tracker not found',
      )
    }

    return this._onboardingMapper.toRoadmapTreeDto(result)
  }
}
