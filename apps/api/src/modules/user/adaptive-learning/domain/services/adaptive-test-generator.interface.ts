import type { AdaptiveAssessmentPlan } from '../adaptive-learning.types'

export interface IAdaptiveTestGenerator {
  generate(userId: string, plan: AdaptiveAssessmentPlan): Promise<{
    testId: string
    title: string
  }>
}
