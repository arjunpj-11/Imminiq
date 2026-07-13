import type {
  AdaptiveAdvisorMessage,
  AdaptiveAssessmentPlan,
  AdaptiveLearnerSnapshot,
  AdaptiveProfile,
} from '../adaptive-learning.types'

export interface IAdaptiveLearningAgent {
  planAssessment(input: {
    snapshot: AdaptiveLearnerSnapshot
    profile: AdaptiveProfile
  }): Promise<AdaptiveAssessmentPlan>
  answer(input: {
    question: string
    snapshot: AdaptiveLearnerSnapshot
    profile: AdaptiveProfile
    history: AdaptiveAdvisorMessage[]
  }): Promise<string>
}
