import type { OnboardingAIJobQueryRepositoryContract } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { OnboardingRoadmapRepositoryContract } from '../../domain/repositories/onboarding-roadmap.repository.interface'
import type { RoadmapTreeResult } from '../dtos/onboarding.dto'
import { OnboardingApplicationError } from '../errors/onboarding-application.error'
import type { OnboardingMapperContract } from '../mappers/onboarding.mapper'
import type { OnboardingJobOutputReaderContract } from '../services/onboarding-job-output-reader.service'

type RoadmapJobResultRepository =
  OnboardingAIJobQueryRepositoryContract &
  OnboardingRoadmapRepositoryContract

export class GetRoadmapJobResultUseCase {
  constructor(
    private readonly _onboardingRepository: RoadmapJobResultRepository,
    private readonly _onboardingMapper: OnboardingMapperContract,
    private readonly _onboardingJobOutputReader: OnboardingJobOutputReaderContract,
  ) {}

  async execute(
    jobId: string,
    userId: string,
  ): Promise<RoadmapTreeResult> {
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
