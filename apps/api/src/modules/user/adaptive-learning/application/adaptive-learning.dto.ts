import type {
  AdaptiveAdvisorMessage,
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
  assessment: AdaptiveAssessment
  test: { testId: string; title: string }
}

export interface IAdaptiveAdvisorChatDTO {
  message: AdaptiveAdvisorMessage
}
