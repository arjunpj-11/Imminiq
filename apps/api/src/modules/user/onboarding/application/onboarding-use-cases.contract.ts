import type * as Application from './index'
export type OnboardingUseCases = {
  continueTrackerIntake: Application.IContinueTrackerIntakeUseCase
  saveOnboardingStepOne: Application.ISaveOnboardingStepOneUseCase
  saveOnboardingStepTwo: Application.ISaveOnboardingStepTwoUseCase
  generateRoadmap: Application.IGenerateRoadmapUseCase
  getActiveRoadmapJob: Application.IGetActiveRoadmapJobUseCase
  getRoadmapJobStatus: Application.IGetRoadmapJobStatusUseCase
  getRoadmapJobResult: Application.IGetRoadmapJobResultUseCase
  evaluateRoadmap: Application.IEvaluateRoadmapUseCase
  getRoadmapEvaluationResult: Application.IGetRoadmapEvaluationResultUseCase
}
