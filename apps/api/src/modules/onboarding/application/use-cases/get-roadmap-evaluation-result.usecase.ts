import type { IOnboardingAIJobQueryRepository } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { IGetEvaluationResultDTO } from '../dtos/onboarding.dto'
import { OnboardingApplicationError } from '../errors/onboarding-application.error'
import type { IOnboardingJobOutputReader } from '../services/onboarding-job-output-reader.service'

export interface IGetRoadmapEvaluationResultUseCase {
  execute(jobId: string, userId: string): Promise<IGetEvaluationResultDTO>
}

export class GetRoadmapEvaluationResultUseCase implements IGetRoadmapEvaluationResultUseCase {
  constructor(
    private readonly _onboardingRepository: IOnboardingAIJobQueryRepository,
    private readonly _onboardingJobOutputReader: IOnboardingJobOutputReader,
  ) {}

  async execute(
    jobId: string,
    userId: string,
  ): Promise<IGetEvaluationResultDTO> {
    const job = await this._onboardingRepository.getJobById(jobId)

    if (!job) {
      throw OnboardingApplicationError.notFound('Evaluation job not found')
    }

    if (!job.belongsTo(userId)) {
      throw OnboardingApplicationError.forbidden()
    }

    if (!job.isEvaluationJob()) {
      throw OnboardingApplicationError.invalidJobType(
        'This job is not a roadmap evaluation job',
      )
    }

    if (!job.isCompleted()) {
      throw OnboardingApplicationError.jobPending(
        'Evaluation is not completed yet',
      )
    }

    const evaluation = this._onboardingJobOutputReader.getEvaluation(
      job.outputData,
    )

    if (!evaluation) {
      throw OnboardingApplicationError.evaluationResultMissing()
    }

    return {
      jobId: job.id,
      trackerId: this._onboardingJobOutputReader.getTrackerId(job.outputData),
      evaluation,
    }
  }
}
