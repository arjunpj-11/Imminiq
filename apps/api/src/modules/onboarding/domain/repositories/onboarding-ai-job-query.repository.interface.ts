import type { AIGenerationJobEntity } from '../entities/ai-generation-job.entity'
import type { AIGenerationStepEntity } from '../entities/ai-generation-step.entity'

export interface OnboardingAIJobQueryRepositoryContract {
  findActiveRoadmapJobForUser(
    userId: string,
  ): Promise<AIGenerationJobEntity | null>

  findActiveEvaluationJobForRoadmap(
    userId: string,
    sourceRoadmapJobId: string,
  ): Promise<AIGenerationJobEntity | null>

  getJobById(jobId: string): Promise<AIGenerationJobEntity | null>

  getJobSteps(jobId: string): Promise<AIGenerationStepEntity[]>
}
