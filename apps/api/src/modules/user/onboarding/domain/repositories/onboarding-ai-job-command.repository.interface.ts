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

  /**
   * Update job fields such as status, currentStep, completedAt and output.
   */
  updateJobStatus?(data: {
    jobId: string;
    status?: string;
    currentStep?: number;
    completedAt?: Date | null;
    output?: Record<string, unknown> | null;
    errorMessage?: string | null;
  }): Promise<void>;
}
