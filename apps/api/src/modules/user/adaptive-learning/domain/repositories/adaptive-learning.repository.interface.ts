import type {
  AdaptiveAdvisorMessage,
  AdaptiveAssessment,
  AdaptiveAssessmentPlan,
  AdaptiveLearnerSnapshot,
  AdaptiveProfile,
} from '../adaptive-learning.types'

export interface IAdaptiveLearningRepository {
  getLearnerSnapshot(userId: string): Promise<AdaptiveLearnerSnapshot>
  getOrCreateProfile(userId: string): Promise<AdaptiveProfile>
  listAssessments(userId: string, limit?: number): Promise<AdaptiveAssessment[]>
  createAssessment(input: {
    userId: string
    testId: string
    plan: AdaptiveAssessmentPlan
    baselineMasteryScore: number
  }): Promise<AdaptiveAssessment>
  listAdvisorMessages(userId: string, limit?: number): Promise<AdaptiveAdvisorMessage[]>
  addAdvisorMessage(input: {
    userId: string
    role: 'user' | 'assistant'
    content: string
  }): Promise<AdaptiveAdvisorMessage>
  recordAssessmentResult(input: {
    userId: string
    testId: string
    attemptId: string
    actualScore: number
  }): Promise<void>
}
