import type {
  AdaptiveAdvisorMessage,
  AdaptiveAdvisorAction,
  AdaptiveAssessment,
  AdaptiveProfile,
} from '../domain/adaptive-learning.types';

export interface AdaptiveLearningDashboardDTO {
  profile: AdaptiveProfile;
  latestAssessment: AdaptiveAssessment | null;
  assessments: AdaptiveAssessment[];
  messages: AdaptiveAdvisorMessage[];
  suggestions: string[];
  learnerSummary: {
    trackerCount: number;
    recentTestCount: number;
    averageScore: number | null;
    streakCount: number;
  };
}

export interface AdaptiveAssessmentGenerationDTO {
  jobId: string;
  status: 'pending';
}

export interface AdaptiveAdvisorChatDTO {
  message: AdaptiveAdvisorMessage;
  action?: AdaptiveAdvisorAction;
}
