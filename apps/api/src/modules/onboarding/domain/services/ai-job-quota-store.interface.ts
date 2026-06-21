export type OnboardingAIJobQuotaPurpose =
  | 'roadmap_generation'
  | 'roadmap_evaluation'

export interface AIJobQuotaConsumeResult {
  allowed: boolean
  retryAfterSeconds?: number
}

export interface AIJobQuotaStoreContract {
  consume(
    purpose: OnboardingAIJobQuotaPurpose,
    userId: string,
  ): Promise<AIJobQuotaConsumeResult>
}
