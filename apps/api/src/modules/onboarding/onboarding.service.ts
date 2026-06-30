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
  private readonly _useCases: OnboardingComposition['useCases']

  constructor(composition: OnboardingComposition) {
    this._useCases = composition.useCases
  }

  getStatus(userId: string): Promise<OnboardingStatusResult> {
    return this._useCases.getOnboardingStatus.execute(userId)
  }

  saveStep1(
    userId: string,
    payload: SaveOnboardingStepOnePayload
  ): Promise<OnboardingResponseRecord | null> {
    return this._useCases.saveOnboardingStepOne.execute(userId, payload)
  }

  saveStep2(
    userId: string,
    payload: SaveOnboardingStepTwoPayload
  ): Promise<OnboardingResponseRecord | null> {
    return this._useCases.saveOnboardingStepTwo.execute(userId, payload)
  }

  generateRoadmap(
    userId: string,
    payload: GenerateRoadmapPayload
  ): Promise<GenerateRoadmapResult> {
    return this._useCases.generateRoadmap.execute(userId, payload)
  }

  getJobStatus(
    jobId: string,
    userId: string
  ): Promise<GetJobStatusResult> {
    return this._useCases.getRoadmapJobStatus.execute(jobId, userId)
  }

  getJobResult(
    jobId: string,
    userId: string
  ): Promise<RoadmapTreeResult> {
    return this._useCases.getRoadmapJobResult.execute(jobId, userId)
  }

  evaluateRoadmap(
    roadmapJobId: string,
    userId: string
  ): Promise<GenerateRoadmapResult> {
    return this._useCases.evaluateRoadmap.execute(roadmapJobId, userId)
  }

  getEvaluationResult(
    jobId: string,
    userId: string
  ): Promise<GetEvaluationResult> {
    return this._useCases.getRoadmapEvaluationResult.execute(jobId, userId)
  }
}

export const onboardingService = new OnboardingService(
  createOnboardingComposition()
)