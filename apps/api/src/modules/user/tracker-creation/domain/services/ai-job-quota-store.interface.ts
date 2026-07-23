export type TrackerCreationAIJobQuotaPurpose = 'roadmap_generation' | 'roadmap_evaluation';

export interface IAIJobQuotaConsumeResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export interface IAIJobQuotaStore {
  consume(
    purpose: TrackerCreationAIJobQuotaPurpose,
    userId: string
  ): Promise<IAIJobQuotaConsumeResult>;
}
