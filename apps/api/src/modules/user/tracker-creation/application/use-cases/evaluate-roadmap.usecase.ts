import { ROADMAP_EVALUATION_STEPS } from '../tracker-creation.constants';
import type { ITrackerCreationAIJobCommandRepository } from '../../domain/repositories/tracker-creation-ai-job-command.repository.interface';
import type { ITrackerCreationAIJobQueryRepository } from '../../domain/repositories/tracker-creation-ai-job-query.repository.interface';
import type { IAIJobQueueGateway } from '../../domain/services/ai-job-queue.interface';
import type { IAIJobQuotaStore } from '../../domain/services/ai-job-quota-store.interface';
import type { GenerateRoadmapResultDTO } from '../tracker-creation.dto';
import { TrackerCreationApplicationError } from '../tracker-creation-application.error';
import type { ITrackerCreationJobOutputReader } from '../services/tracker-creation-job-output-reader.service';

type EvaluateRoadmapRepository = ITrackerCreationAIJobQueryRepository &
  ITrackerCreationAIJobCommandRepository;

export interface IEvaluateRoadmapUseCase {
  execute(roadmapJobId: string, userId: string): Promise<GenerateRoadmapResultDTO>;
}

export class EvaluateRoadmapUseCase implements IEvaluateRoadmapUseCase {
  constructor(
    private readonly _trackerCreationRepository: EvaluateRoadmapRepository,
    private readonly _aiJobQueueGateway: IAIJobQueueGateway,
    private readonly _aiJobQuotaStore: IAIJobQuotaStore,
    private readonly _trackerCreationJobOutputReader: ITrackerCreationJobOutputReader
  ) {}

  async execute(roadmapJobId: string, userId: string): Promise<GenerateRoadmapResultDTO> {
    const roadmapJob = await this._trackerCreationRepository.getJobById(roadmapJobId);

    if (!roadmapJob) {
      throw TrackerCreationApplicationError.notFound('Roadmap job not found');
    }

    if (!roadmapJob.belongsTo(userId)) {
      throw TrackerCreationApplicationError.forbidden();
    }

    if (!roadmapJob.isRoadmapJob()) {
      throw TrackerCreationApplicationError.invalidJobType(
        'Only roadmap generation jobs can be evaluated'
      );
    }

    if (!roadmapJob.isCompleted()) {
      throw TrackerCreationApplicationError.jobPending('Roadmap generation is not completed yet');
    }

    const trackerId = this._trackerCreationJobOutputReader.getTrackerId(roadmapJob.outputData);

    if (!trackerId) {
      throw TrackerCreationApplicationError.trackerNotFound('Generated tracker is missing');
    }

    const activeEvaluationJob =
      await this._trackerCreationRepository.findActiveEvaluationJobForRoadmap({
        userId,
        sourceRoadmapJobId: roadmapJobId,
      });

    if (activeEvaluationJob) {
      throw TrackerCreationApplicationError.evaluationJobAlreadyActive();
    }

    const quota = await this._aiJobQuotaStore.consume('roadmap_evaluation', userId);

    if (!quota.allowed) {
      throw TrackerCreationApplicationError.roadmapEvaluationQuotaExceeded();
    }

    const evaluationJob = await this._trackerCreationRepository.createEvaluationAIJob({
      userId,
      inputData: {
        sourceRoadmapJobId: roadmapJobId,
        analysisKind: 'generated_roadmap',
        trackerId,
      },
    });

    await this._trackerCreationRepository.createAIJobSteps({
      jobId: evaluationJob.id,
      stepLabels: ROADMAP_EVALUATION_STEPS,
    });

    try {
      await this._aiJobQueueGateway.enqueueRoadmapEvaluation({
        jobId: evaluationJob.id,
        userId,
        trackerId,
        sourceRoadmapJobId: roadmapJobId,
        analysisKind: 'generated_roadmap',
      });
    } catch (error) {
      throw TrackerCreationApplicationError.aiQueueError(
        error instanceof Error ? error.message : 'Failed to enqueue AI roadmap evaluation job'
      );
    }

    return { jobId: evaluationJob.id };
  }
}
