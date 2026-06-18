import type { OnboardingAIJobQueryRepositoryContract } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { OnboardingRoadmapRepositoryContract } from '../../domain/repositories/onboarding-roadmap.repository.interface'
import type { RoadmapTreeResult } from '../dtos/onboarding.dto'
import { OnboardingApplicationError } from '../errors/onboarding-application.error'
import type { OnboardingMapperContract } from '../mappers/onboarding.mapper'
import type { OnboardingJobOutputReaderServiceContract } from '../services/onboarding-job-output-reader.service'

type RoadmapJobResultRepository =
  OnboardingAIJobQueryRepositoryContract &
  OnboardingRoadmapRepositoryContract

export class GetRoadmapJobResultUseCase {
  constructor(
    private readonly onboardingRepository: RoadmapJobResultRepository,
    private readonly onboardingMapper: OnboardingMapperContract,
    private readonly onboardingJobOutputReader: OnboardingJobOutputReaderServiceContract,
  ) {}

  async execute(
    jobId: string,
    userId: string,
  ): Promise<RoadmapTreeResult> {
    const job = await this.onboardingRepository.getJobById(jobId)

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

    const trackerId = this.onboardingJobOutputReader.getTrackerId(job.outputData)

    if (!trackerId) {
      throw OnboardingApplicationError.serverError('Tracker not created')
    }

    const result = await this.onboardingRepository.getRoadmapTree(trackerId)

    if (!result.tracker) {
      throw OnboardingApplicationError.trackerNotFound(
        'Generated tracker not found',
      )
    }

    return this.onboardingMapper.toRoadmapTreeDto(result)
  }
}
