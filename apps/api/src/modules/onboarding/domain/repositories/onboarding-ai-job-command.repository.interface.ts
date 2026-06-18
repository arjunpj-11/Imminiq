import type { AIGenerationJobEntity } from '../entities/ai-generation-job.entity'
import type { RoadmapLevel } from '../value-objects/roadmap-level.vo'

export interface RoadmapJobInput {
  topic: string
  goal?: string
  level: RoadmapLevel
}

export interface EvaluationJobInput {
  sourceRoadmapJobId: string
  trackerId: string
}

export interface OnboardingAIJobCommandRepositoryContract {
  createAIJob(
    userId: string,
    inputData: RoadmapJobInput,
  ): Promise<AIGenerationJobEntity>

  createEvaluationAIJob(
    userId: string,
    inputData: EvaluationJobInput,
  ): Promise<AIGenerationJobEntity>

  createAIJobSteps(
    jobId: string,
    stepLabels: readonly string[],
  ): Promise<void>
}
