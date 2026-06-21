import type {
  GenerateRoadmapPayload,
  GenerateRoadmapResult,
  GetEvaluationResult,
  GetJobStatusResult,
  OnboardingResponseRecord,
  OnboardingStatusResult,
  RoadmapTreeResult,
  SaveOnboardingStepOnePayload,
  SaveOnboardingStepTwoPayload,
} from './application/dtos/onboarding.dto'
import {
  createOnboardingComposition,
  type OnboardingComposition,
} from './onboarding.factory'

export class OnboardingService {
  private readonly useCases: OnboardingComposition['useCases']

  constructor(composition: OnboardingComposition) {
    this.useCases = composition.useCases
  }

  getStatus(userId: string): Promise<OnboardingStatusResult> {
    return this.useCases.getOnboardingStatus.execute(userId)
  }

  saveStep1(
    userId: string,
    payload: SaveOnboardingStepOnePayload
  ): Promise<OnboardingResponseRecord | null> {
    return this.useCases.saveOnboardingStepOne.execute(userId, payload)
  }

  saveStep2(
    userId: string,
    payload: SaveOnboardingStepTwoPayload
  ): Promise<OnboardingResponseRecord | null> {
    return this.useCases.saveOnboardingStepTwo.execute(userId, payload)
  }

  generateRoadmap(
    userId: string,
    payload: GenerateRoadmapPayload
  ): Promise<GenerateRoadmapResult> {
    return this.useCases.generateRoadmap.execute(userId, payload)
  }

  getJobStatus(
    jobId: string,
    userId: string
  ): Promise<GetJobStatusResult> {
    return this.useCases.getRoadmapJobStatus.execute(jobId, userId)
  }

  getJobResult(
    jobId: string,
    userId: string
  ): Promise<RoadmapTreeResult> {
    return this.useCases.getRoadmapJobResult.execute(jobId, userId)
  }

  evaluateRoadmap(
    roadmapJobId: string,
    userId: string
  ): Promise<GenerateRoadmapResult> {
    return this.useCases.evaluateRoadmap.execute(roadmapJobId, userId)
  }

  getEvaluationResult(
    jobId: string,
    userId: string
  ): Promise<GetEvaluationResult> {
    return this.useCases.getRoadmapEvaluationResult.execute(jobId, userId)
  }
}

export const onboardingService = new OnboardingService(
  createOnboardingComposition()
)