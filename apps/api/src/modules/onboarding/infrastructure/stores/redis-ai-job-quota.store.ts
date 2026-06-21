import {
  AI_JOB_QUOTA_POLICIES,
  aiJobQuotaCache,
} from '../../../../infrastructure/cache/ai-job-quota.cache'
import { OnboardingDomainError } from '../../domain/errors/onboarding-domain.error'
import type {
  AIJobQuotaConsumeResult,
  AIJobQuotaStoreContract,
  OnboardingAIJobQuotaPurpose,
} from '../../domain/services/ai-job-quota-store.interface'

export class RedisAIJobQuotaStore implements AIJobQuotaStoreContract {
  async consume(
    purpose: OnboardingAIJobQuotaPurpose,
    userId: string,
  ): Promise<AIJobQuotaConsumeResult> {
    try {
      return await aiJobQuotaCache.consume(
        purpose,
        userId,
        this.getPolicy(purpose),
      )
    } catch {
      throw new OnboardingDomainError(
        'AI_JOB_QUOTA_STORE_ERROR',
        'Failed to consume onboarding AI job quota',
      )
    }
  }

  private getPolicy(purpose: OnboardingAIJobQuotaPurpose) {
    return purpose === 'roadmap_generation'
      ? AI_JOB_QUOTA_POLICIES.roadmapGeneration
      : AI_JOB_QUOTA_POLICIES.roadmapEvaluation
  }
}

export const redisAIJobQuotaStore = new RedisAIJobQuotaStore()
