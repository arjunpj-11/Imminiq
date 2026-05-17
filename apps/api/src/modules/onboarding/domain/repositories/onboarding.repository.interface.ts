import type {
  AIGenerationJobRecord,
  AIGenerationStepRecord,
  EvaluationJobInput,
  OnboardingResponseRecord,
  RoadmapJobInput,
  RoadmapLevel,
  RoadmapTreeResult,
} from '../types/onboarding.types'

export interface OnboardingRepository {
  getStatus(userId: string): Promise<OnboardingResponseRecord | null>

  saveStep1(
    userId: string,
    topic: string,
    goal?: string
  ): Promise<OnboardingResponseRecord | null>

  saveStep2(
    userId: string,
    level: RoadmapLevel
  ): Promise<OnboardingResponseRecord | null>

  markCompleted(userId: string): Promise<OnboardingResponseRecord | null>

  findActiveRoadmapJobForUser(
    userId: string
  ): Promise<AIGenerationJobRecord | null>

  findActiveEvaluationJobForRoadmap(
    userId: string,
    sourceRoadmapJobId: string
  ): Promise<AIGenerationJobRecord | null>

  createAIJob(
    userId: string,
    inputData: RoadmapJobInput
  ): Promise<AIGenerationJobRecord>

  createEvaluationAIJob(
    userId: string,
    inputData: EvaluationJobInput
  ): Promise<AIGenerationJobRecord>

  createAIJobSteps(
    jobId: string,
    stepLabels: string[]
  ): Promise<unknown>

  getJobById(jobId: string): Promise<AIGenerationJobRecord | null>

  getJobSteps(jobId: string): Promise<AIGenerationStepRecord[]>

  getRoadmapTree(trackerId: string): Promise<RoadmapTreeResult>
}
