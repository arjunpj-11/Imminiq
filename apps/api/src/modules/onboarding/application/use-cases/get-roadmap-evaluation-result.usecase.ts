import type { OnboardingAIJobQueryRepositoryContract } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { GetEvaluationResult } from '../dtos/onboarding.dto'
import { OnboardingApplicationError } from '../errors/onboarding-application.error'
import type { OnboardingJobOutputReaderServiceContract } from '../services/onboarding-job-output-reader.service'

export class GetRoadmapEvaluationResultUseCase {
  constructor(
    private readonly onboardingRepository: OnboardingAIJobQueryRepositoryContract,
    private readonly onboardingJobOutputReader: OnboardingJobOutputReaderServiceContract,
  ) {}

  async execute(
    jobId: string,
    userId: string,
  ): Promise<GetEvaluationResult> {
    const job = await this.onboardingRepository.getJobById(jobId)

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

    const evaluation = this.onboardingJobOutputReader.getEvaluation(
      job.outputData,
    )

    if (!evaluation) {
      throw OnboardingApplicationError.evaluationResultMissing()
    }

    return {
      jobId: job.id,
      trackerId: this.onboardingJobOutputReader.getTrackerId(job.outputData),
      evaluation,
    }
  }
}
