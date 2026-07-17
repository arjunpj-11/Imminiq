import type { ITrackerCreationAIJobQueryRepository } from '../../domain/repositories/tracker-creation-ai-job-query.repository.interface';

export interface IGetActiveRoadmapJobUseCase {
  execute(userId: string): Promise<{
    jobId: string;
    status: 'pending' | 'processing';
  } | null>;
}

export class GetActiveRoadmapJobUseCase implements IGetActiveRoadmapJobUseCase {
  constructor(private readonly _repository: ITrackerCreationAIJobQueryRepository) {}

  async execute(userId: string) {
    const job = await this._repository.findActiveRoadmapJobForUser(userId);
    if (!job || (job.status !== 'pending' && job.status !== 'processing')) {
      return null;
    }

    return { jobId: job.id, status: job.status };
  }
}
