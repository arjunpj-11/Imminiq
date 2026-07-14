import type {
  AdaptiveAdvisorChatDTO,
  AdaptiveAssessmentGenerationDTO,
  AdaptiveLearningDashboardDTO,
} from './adaptive-learning.dto';

export interface IAdaptiveLearningMapper {
  toDashboard(data: AdaptiveLearningDashboardDTO): AdaptiveLearningDashboardDTO;
  toAssessmentGeneration(data: AdaptiveAssessmentGenerationDTO): AdaptiveAssessmentGenerationDTO;
  toAdvisorChat(data: AdaptiveAdvisorChatDTO): AdaptiveAdvisorChatDTO;
}

export class AdaptiveLearningMapper implements IAdaptiveLearningMapper {
  toDashboard(data: AdaptiveLearningDashboardDTO) {
    return data;
  }

  toAssessmentGeneration(data: AdaptiveAssessmentGenerationDTO) {
    return data;
  }

  toAdvisorChat(data: AdaptiveAdvisorChatDTO) {
    return data;
  }
}
