import type {
  AdaptiveAdvisorMessage,
  AdaptiveAdvisorAction,
  AdaptiveAssessment,
  AdaptiveProfile,
} from '../domain/adaptive-learning.types'

export interface IAdaptiveLearningDashboardDTO {
  profile: AdaptiveProfile
  latestAssessment: AdaptiveAssessment | null
  assessments: AdaptiveAssessment[]
  messages: AdaptiveAdvisorMessage[]
  suggestions: string[]
  learnerSummary: {
    trackerCount: number
    recentTestCount: number
    averageScore: number | null
    streakCount: number
  }
}

export interface IAdaptiveAssessmentGenerationDTO {
  jobId: string
  status: 'pending'
}

export interface IAdaptiveAdvisorChatDTO {
  message: AdaptiveAdvisorMessage
  action?: AdaptiveAdvisorAction
}
