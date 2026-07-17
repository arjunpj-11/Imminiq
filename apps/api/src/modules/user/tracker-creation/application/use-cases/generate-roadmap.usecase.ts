import { ROADMAP_GENERATION_STEPS } from '../tracker-creation.constants';
import type { ITrackerCreationAIJobCommandRepository } from '../../domain/repositories/tracker-creation-ai-job-command.repository.interface';
import type { ITrackerCreationAIJobQueryRepository } from '../../domain/repositories/tracker-creation-ai-job-query.repository.interface';
import type { ITrackerCreationResponseCommandRepository } from '../../domain/repositories/tracker-creation-response-command.repository.interface';
import type { IAIJobQueueGateway } from '../../domain/services/ai-job-queue.interface';
import type { IAIJobQuotaStore } from '../../domain/services/ai-job-quota-store.interface';
import type { GenerateRoadmapPayloadDTO, GenerateRoadmapResultDTO } from '../tracker-creation.dto';
import { TrackerCreationApplicationError } from '../tracker-creation-application.error';

type GenerateRoadmapRepository = ITrackerCreationAIJobQueryRepository &
  ITrackerCreationAIJobCommandRepository &
  ITrackerCreationResponseCommandRepository;

export interface IGenerateRoadmapUseCase {
  execute(userId: string, payload: GenerateRoadmapPayloadDTO): Promise<GenerateRoadmapResultDTO>;
}

export class GenerateRoadmapUseCase implements IGenerateRoadmapUseCase {
  constructor(
    private readonly _trackerCreationRepository: GenerateRoadmapRepository,
    private readonly _aiJobQueueGateway: IAIJobQueueGateway,
    private readonly _aiJobQuotaStore: IAIJobQuotaStore
  ) {}

  async execute(
    userId: string,
    payload: GenerateRoadmapPayloadDTO
  ): Promise<GenerateRoadmapResultDTO> {
    const activeRoadmapJob = await this._trackerCreationRepository.findActiveRoadmapJobForUser(userId);

    if (activeRoadmapJob) {
      throw TrackerCreationApplicationError.roadmapJobAlreadyActive();
    }

    const quota = await this._aiJobQuotaStore.consume('roadmap_generation', userId);

    if (!quota.allowed) {
      throw TrackerCreationApplicationError.roadmapGenerationQuotaExceeded();
    }

    await this._trackerCreationRepository.saveStep1({
      userId,
      topic: payload.topic,
      goal: payload.goal,
      preferredLanguage: payload.preferredLanguage,
    });

    await this._trackerCreationRepository.saveStep2({
      userId,
      level: payload.level,
    });

    const aiJob = await this._trackerCreationRepository.createAIJob({
      userId,
      inputData: {
        topic: payload.topic,
        ...(payload.goal ? { goal: payload.goal } : {}),
        level: payload.level,
        preferredLanguage: payload.preferredLanguage,
      },
    });

    await this._trackerCreationRepository.createAIJobSteps({
      jobId: aiJob.id,
      stepLabels: ROADMAP_GENERATION_STEPS,
    });

    try {
      await this._aiJobQueueGateway.enqueueRoadmapGeneration({
        jobId: aiJob.id,
        userId,
        topic: payload.topic,
        ...(payload.goal ? { goal: payload.goal } : {}),
        level: payload.level,
        preferredLanguage: payload.preferredLanguage,
      });
    } catch (error) {
      throw TrackerCreationApplicationError.aiQueueError(
        error instanceof Error ? error.message : 'Failed to enqueue AI roadmap generation job'
      );
    }

    return { jobId: aiJob.id };
  }
}
