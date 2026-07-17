import { ROADMAP_EVALUATION_STEPS } from '../tracker-creation.constants';
import { TrackerCreationApplicationError } from '../tracker-creation-application.error';
import type { GenerateRoadmapResultDTO } from '../tracker-creation.dto';
import type { ITrackerCreationAIJobCommandRepository } from '../../domain/repositories/tracker-creation-ai-job-command.repository.interface';
import type { ICloneFreshnessAnalysisRepository } from '../../domain/repositories/clone-freshness-analysis.repository.interface';
import type { IAIJobQueueGateway } from '../../domain/services/ai-job-queue.interface';
import type { IAIJobQuotaStore } from '../../domain/services/ai-job-quota-store.interface';

export interface IAnalyzeClonedTrackerUseCase {
  execute(trackerId: string, userId: string): Promise<GenerateRoadmapResultDTO>;
}

export class AnalyzeClonedTrackerUseCase implements IAnalyzeClonedTrackerUseCase {
  constructor(
    private readonly jobs: ITrackerCreationAIJobCommandRepository,
    private readonly clones: ICloneFreshnessAnalysisRepository,
    private readonly queue: IAIJobQueueGateway,
    private readonly quota: IAIJobQuotaStore
  ) {}

  async execute(trackerId: string, userId: string): Promise<GenerateRoadmapResultDTO> {
    const claim = await this.clones.claim({ trackerId, userId });

    if (claim.status === 'not_found') {
      throw TrackerCreationApplicationError.trackerNotFound(
        'Cloned tracker not found or does not belong to you.'
      );
    }
    if (claim.status === 'already_used') {
      throw TrackerCreationApplicationError.cloneFreshnessAnalysisAlreadyUsed();
    }

    const quota = await this.quota.consume('roadmap_evaluation', userId);
    if (!quota.allowed) {
      await this.clones.markFailed({ trackerId, userId });
      throw TrackerCreationApplicationError.roadmapEvaluationQuotaExceeded();
    }

    const sourceTrackerCreatedAt = claim.sourceTrackerCreatedAt.toISOString();

    try {
      const job = await this.jobs.createEvaluationAIJob({
        userId,
        inputData: {
          trackerId,
          sourceTrackerId: claim.sourceTrackerId,
          sourceTrackerCreatedAt,
          analysisKind: 'clone_freshness',
        },
      });

      await this.jobs.createAIJobSteps({
        jobId: job.id,
        stepLabels: ROADMAP_EVALUATION_STEPS,
      });
      await this.clones.attachJob({ trackerId, userId, jobId: job.id });
      await this.queue.enqueueRoadmapEvaluation({
        jobId: job.id,
        userId,
        trackerId,
        sourceTrackerId: claim.sourceTrackerId,
        sourceTrackerCreatedAt,
        analysisKind: 'clone_freshness',
      });

      return { jobId: job.id };
    } catch (error) {
      await this.clones.markFailed({ trackerId, userId });
      throw TrackerCreationApplicationError.aiQueueError(
        error instanceof Error ? error.message : 'Failed to start cloned tracker analysis'
      );
    }
  }
}
