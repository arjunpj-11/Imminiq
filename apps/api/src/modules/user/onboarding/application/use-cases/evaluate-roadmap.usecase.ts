import { ROADMAP_EVALUATION_STEPS } from '../onboarding.constants';
import type { IOnboardingAIJobCommandRepository } from '../../domain/repositories/onboarding-ai-job-command.repository.interface';
import type { IOnboardingAIJobQueryRepository } from '../../domain/repositories/onboarding-ai-job-query.repository.interface';
import type { IAIJobQueueGateway } from '../../domain/services/ai-job-queue.interface';
import type { IAIJobQuotaStore } from '../../domain/services/ai-job-quota-store.interface';
import type { GenerateRoadmapResultDTO } from '../onboarding.dto';
import { OnboardingApplicationError } from '../onboarding-application.error';
import type { IOnboardingJobOutputReader } from '../services/onboarding-job-output-reader.service';

type EvaluateRoadmapRepository = IOnboardingAIJobQueryRepository &
  IOnboardingAIJobCommandRepository;

export interface IEvaluateRoadmapUseCase {
  execute(roadmapJobId: string, userId: string): Promise<GenerateRoadmapResultDTO>;
}

export class EvaluateRoadmapUseCase implements IEvaluateRoadmapUseCase {
  constructor(
    private readonly _onboardingRepository: EvaluateRoadmapRepository,
    private readonly _aiJobQueueGateway: IAIJobQueueGateway,
    private readonly _aiJobQuotaStore: IAIJobQuotaStore,
    private readonly _onboardingJobOutputReader: IOnboardingJobOutputReader
  ) {}

  async execute(roadmapJobId: string, userId: string): Promise<GenerateRoadmapResultDTO> {
    const roadmapJob = await this._onboardingRepository.getJobById(roadmapJobId);

    if (!roadmapJob) {
      throw OnboardingApplicationError.notFound('Roadmap job not found');
    }

    if (!roadmapJob.belongsTo(userId)) {
      throw OnboardingApplicationError.forbidden();
    }

    if (!roadmapJob.isRoadmapJob()) {
      throw OnboardingApplicationError.invalidJobType(
        'Only roadmap generation jobs can be evaluated'
      );
    }

    if (!roadmapJob.isCompleted()) {
      throw OnboardingApplicationError.jobPending('Roadmap generation is not completed yet');
    }

    const trackerId = this._onboardingJobOutputReader.getTrackerId(roadmapJob.outputData);

    if (!trackerId) {
      throw OnboardingApplicationError.trackerNotFound('Generated tracker is missing');
    }

    const activeEvaluationJob = await this._onboardingRepository.findActiveEvaluationJobForRoadmap({
      userId,
      sourceRoadmapJobId: roadmapJobId,
    });

    if (activeEvaluationJob) {
      throw OnboardingApplicationError.evaluationJobAlreadyActive();
    }

    const quota = await this._aiJobQuotaStore.consume('roadmap_evaluation', userId);

    if (!quota.allowed) {
      throw OnboardingApplicationError.roadmapEvaluationQuotaExceeded();
    }

    const evaluationJob = await this._onboardingRepository.createEvaluationAIJob({
      userId,
      inputData: {
        sourceRoadmapJobId: roadmapJobId,
        trackerId,
      },
    });

    await this._onboardingRepository.createAIJobSteps({
      jobId: evaluationJob.id,
      stepLabels: ROADMAP_EVALUATION_STEPS,
    });

    try {
      await this._aiJobQueueGateway.enqueueRoadmapEvaluation({
        jobId: evaluationJob.id,
        userId,
        trackerId,
        sourceRoadmapJobId: roadmapJobId,
      });
    } catch (error) {
      throw OnboardingApplicationError.aiQueueError(
        error instanceof Error ? error.message : 'Failed to enqueue AI roadmap evaluation job'
      );
    }

    return { jobId: evaluationJob.id };
  }
}
