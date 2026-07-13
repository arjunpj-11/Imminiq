export type OnboardingAIJobQuotaPurpose = 'roadmap_generation' | 'roadmap_evaluation';

export interface IAIJobQuotaConsumeResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export interface IAIJobQuotaStore {
  consume(purpose: OnboardingAIJobQuotaPurpose, userId: string): Promise<IAIJobQuotaConsumeResult>;
}
