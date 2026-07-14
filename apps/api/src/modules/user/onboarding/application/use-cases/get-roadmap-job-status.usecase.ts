import type { IOnboardingAIJobQueryRepository } from '../../domain/repositories/onboarding-ai-job-query.repository.interface';
import type { IGetJobStatusResultDTO } from '../onboarding.dto';
import { OnboardingApplicationError } from '../onboarding-application.error';
import type { IOnboardingMapper } from '../onboarding.mapper';
import type { IOnboardingJobOutputReader } from '../services/onboarding-job-output-reader.service';

export interface IGetRoadmapJobStatusUseCase {
  execute(jobId: string, userId: string): Promise<IGetJobStatusResultDTO>;
}

export class GetRoadmapJobStatusUseCase implements IGetRoadmapJobStatusUseCase {
  constructor(
    private readonly _onboardingRepository: IOnboardingAIJobQueryRepository,
    private readonly _onboardingMapper: IOnboardingMapper,
    private readonly _onboardingJobOutputReader: IOnboardingJobOutputReader
  ) {}

  async execute(jobId: string, userId: string): Promise<IGetJobStatusResultDTO> {
    const job = await this._onboardingRepository.getJobById(jobId);

    if (!job) {
      throw OnboardingApplicationError.notFound('Job not found');
    }

    if (!job.belongsTo(userId)) {
      throw OnboardingApplicationError.forbidden();
    }

    const steps = await this._onboardingRepository.getJobSteps(jobId);
    const trackerId = this._onboardingJobOutputReader.getTrackerId(job.outputData);
    const testId = this._onboardingJobOutputReader.getTestId(job.outputData);

    return this._onboardingMapper.toJobStatusDto(job, steps, trackerId, testId);
  }
}
