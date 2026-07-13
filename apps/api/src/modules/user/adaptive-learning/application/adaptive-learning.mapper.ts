import type {
  IAdaptiveAdvisorChatDTO,
  IAdaptiveAssessmentGenerationDTO,
  IAdaptiveLearningDashboardDTO,
} from './adaptive-learning.dto'

export interface IAdaptiveLearningMapper {
  toDashboard(data: IAdaptiveLearningDashboardDTO): IAdaptiveLearningDashboardDTO
  toAssessmentGeneration(
    data: IAdaptiveAssessmentGenerationDTO,
  ): IAdaptiveAssessmentGenerationDTO
  toAdvisorChat(data: IAdaptiveAdvisorChatDTO): IAdaptiveAdvisorChatDTO
}

export class AdaptiveLearningMapper implements IAdaptiveLearningMapper {
  toDashboard(data: IAdaptiveLearningDashboardDTO) {
    return data
  }

  toAssessmentGeneration(data: IAdaptiveAssessmentGenerationDTO) {
    return data
  }

  toAdvisorChat(data: IAdaptiveAdvisorChatDTO) {
    return data
  }
}
