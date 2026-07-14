import type { AIGenerationJobEntity } from '../entities/ai-generation-job.entity';
import type { AIGenerationStepEntity } from '../entities/ai-generation-step.entity';

export type FindActiveEvaluationJobForRoadmapInput = {
  userId: string;
  sourceRoadmapJobId: string;
};

export interface IOnboardingAIJobQueryRepository {
  findActiveRoadmapJobForUser(userId: string): Promise<AIGenerationJobEntity | null>;

  findActiveEvaluationJobForRoadmap(
    input: FindActiveEvaluationJobForRoadmapInput
  ): Promise<AIGenerationJobEntity | null>;

  getJobById(jobId: string): Promise<AIGenerationJobEntity | null>;

  getJobSteps(jobId: string): Promise<AIGenerationStepEntity[]>;
}
