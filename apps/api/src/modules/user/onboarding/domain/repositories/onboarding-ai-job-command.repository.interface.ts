import type { AIGenerationJobEntity } from '../entities/ai-generation-job.entity';
import type { RoadmapLevel } from '../value-objects/roadmap-level.vo';

export type RoadmapJobInput = {
  topic: string;
  goal?: string;
  level: RoadmapLevel;
};

export type EvaluationJobInput = {
  sourceRoadmapJobId: string;
  trackerId: string;
};

export type CreateRoadmapAIJobInput = {
  userId: string;
  inputData: RoadmapJobInput;
};

export type CreateEvaluationAIJobInput = {
  userId: string;
  inputData: EvaluationJobInput;
};

export type CreateAIJobStepsInput = {
  jobId: string;
  stepLabels: readonly string[];
};

export interface IOnboardingAIJobCommandRepository {
  createAIJob(data: CreateRoadmapAIJobInput): Promise<AIGenerationJobEntity>;

  createEvaluationAIJob(data: CreateEvaluationAIJobInput): Promise<AIGenerationJobEntity>;

  createAIJobSteps(data: CreateAIJobStepsInput): Promise<void>;
}
