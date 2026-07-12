import type * as Application from '../index'
export type OnboardingUseCases = {
  saveOnboardingStepOne: Application.ISaveOnboardingStepOneUseCase
  saveOnboardingStepTwo: Application.ISaveOnboardingStepTwoUseCase
  generateRoadmap: Application.IGenerateRoadmapUseCase
  getRoadmapJobStatus: Application.IGetRoadmapJobStatusUseCase
  getRoadmapJobResult: Application.IGetRoadmapJobResultUseCase
  evaluateRoadmap: Application.IEvaluateRoadmapUseCase
  getRoadmapEvaluationResult: Application.IGetRoadmapEvaluationResultUseCase
}
