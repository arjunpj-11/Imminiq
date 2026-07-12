import type * as Application from '../index'
export type OnboardingUseCases = {
  getOnboardingStatus: Application.GetOnboardingStatusUseCase
  saveOnboardingStepOne: Application.SaveOnboardingStepOneUseCase
  saveOnboardingStepTwo: Application.SaveOnboardingStepTwoUseCase
  generateRoadmap: Application.GenerateRoadmapUseCase
  getRoadmapJobStatus: Application.GetRoadmapJobStatusUseCase
  getRoadmapJobResult: Application.GetRoadmapJobResultUseCase
  evaluateRoadmap: Application.EvaluateRoadmapUseCase
  getRoadmapEvaluationResult: Application.GetRoadmapEvaluationResultUseCase
}
