import type * as Application from './index'

export type AdaptiveLearningUseCases = {
  getDashboard: Application.IGetAdaptiveLearningDashboardUseCase
  generateAssessment: Application.IGenerateAdaptiveAssessmentUseCase
  chatWithAdvisor: Application.IChatWithAdaptiveAdvisorUseCase
}
