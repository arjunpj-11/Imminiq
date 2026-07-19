import type { AdaptiveAssessmentPlan } from '../adaptive-learning.types';

export type ActiveAdaptiveAssessmentGeneration = {
  jobId: string;
  status: 'pending' | 'processing';
};

export interface IAdaptiveTestGenerator {
  findActive(userId: string): Promise<ActiveAdaptiveAssessmentGeneration | null>;
  generate(
    userId: string,
    plan: AdaptiveAssessmentPlan,
    baselineMasteryScore: number
  ): Promise<{ jobId: string; status: 'pending' }>;
}
