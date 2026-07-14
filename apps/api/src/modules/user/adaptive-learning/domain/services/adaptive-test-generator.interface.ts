import type { AdaptiveAssessmentPlan } from '../adaptive-learning.types';

export interface IAdaptiveTestGenerator {
  generate(
    userId: string,
    plan: AdaptiveAssessmentPlan,
    baselineMasteryScore: number
  ): Promise<{ jobId: string; status: 'pending' }>;
}
