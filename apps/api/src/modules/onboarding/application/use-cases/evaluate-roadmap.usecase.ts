import { ROADMAP_EVALUATION_STEPS } from '../constants/onboarding.constants'
import type { OnboardingAIJobCommandRepositoryContract } from '../../domain/repositories/onboarding-ai-job-command.repository.interface'
import type { OnboardingAIJobQueryRepositoryContract } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { AIJobQueueGatewayContract } from '../../domain/services/ai-job-queue.interface'
import type { AIJobQuotaStoreContract } from '../../domain/services/ai-job-quota-store.interface'
import type { GenerateRoadmapResult } from '../dtos/onboarding.dto'
import { OnboardingApplicationError } from '../errors/onboarding-application.error'
import type { OnboardingJobOutputReaderServiceContract } from '../services/onboarding-job-output-reader.service'

type EvaluateRoadmapRepository =
  OnboardingAIJobQueryRepositoryContract &
  OnboardingAIJobCommandRepositoryContract

export class EvaluateRoadmapUseCase {
  constructor(
    private readonly _onboardingRepository: EvaluateRoadmapRepository,
    private readonly _aiJobQueueGateway: AIJobQueueGatewayContract,
    private readonly _aiJobQuotaStore: AIJobQuotaStoreContract,
    private readonly _onboardingJobOutputReader: OnboardingJobOutputReaderServiceContract,
  ) {}

  async execute(
    roadmapJobId: string,
    userId: string,
  ): Promise<GenerateRoadmapResult> {
    const roadmapJob = await this._onboardingRepository.getJobById(roadmapJobId)

    if (!roadmapJob) {
      throw OnboardingApplicationError.notFound('Roadmap job not found')
    }

    if (!roadmapJob.belongsTo(userId)) {
      throw OnboardingApplicationError.forbidden()
    }

    if (!roadmapJob.isRoadmapJob()) {
      throw OnboardingApplicationError.invalidJobType(
        'Only roadmap generation jobs can be evaluated',
      )
    }

    if (!roadmapJob.isCompleted()) {
      throw OnboardingApplicationError.jobPending(
        'Roadmap generation is not completed yet',
      )
    }

    const trackerId = this._onboardingJobOutputReader.getTrackerId(
      roadmapJob.outputData,
    )

    if (!trackerId) {
      throw OnboardingApplicationError.trackerNotFound(
        'Generated tracker is missing',
      )
    }

    const activeEvaluationJob =
      await this._onboardingRepository.findActiveEvaluationJobForRoadmap({
        userId,
        sourceRoadmapJobId: roadmapJobId,
      })

    if (activeEvaluationJob) {
      throw OnboardingApplicationError.evaluationJobAlreadyActive()
    }

    const quota = await this._aiJobQuotaStore.consume(
      'roadmap_evaluation',
      userId,
    )

    if (!quota.allowed) {
      throw OnboardingApplicationError.roadmapEvaluationQuotaExceeded()
    }

    const evaluationJob =
      await this._onboardingRepository.createEvaluationAIJob({
        userId,
        inputData: {
          sourceRoadmapJobId: roadmapJobId,
          trackerId,
        },
      })

    await this._onboardingRepository.createAIJobSteps({
      jobId: evaluationJob.id,
      stepLabels: ROADMAP_EVALUATION_STEPS,
    })

    try {
      await this._aiJobQueueGateway.enqueueRoadmapEvaluation({
        jobId: evaluationJob.id,
        userId,
        trackerId,
        sourceRoadmapJobId: roadmapJobId,
      })
    } catch (error) {
      throw OnboardingApplicationError.aiQueueError(
        error instanceof Error
          ? error.message
          : 'Failed to enqueue AI roadmap evaluation job',
      )
    }

    return { jobId: evaluationJob.id }
  }
}