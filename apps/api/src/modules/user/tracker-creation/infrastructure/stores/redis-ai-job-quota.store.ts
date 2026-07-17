import {
  AI_JOB_QUOTA_POLICIES,
  aiJobQuotaCache,
} from '../../../../../infrastructure/cache/ai-job-quota.cache';
import { TrackerCreationDomainError } from '../../domain/tracker-creation-domain.error';
import type {
  IAIJobQuotaConsumeResult,
  IAIJobQuotaStore,
  TrackerCreationAIJobQuotaPurpose,
} from '../../domain/services/ai-job-quota-store.interface';

export class RedisAIJobQuotaStore implements IAIJobQuotaStore {
  async consume(
    purpose: TrackerCreationAIJobQuotaPurpose,
    userId: string
  ): Promise<IAIJobQuotaConsumeResult> {
    try {
      return await aiJobQuotaCache.consume(purpose, userId, this.getPolicy(purpose));
    } catch {
      throw new TrackerCreationDomainError(
        'AI_JOB_QUOTA_STORE_ERROR',
        'Failed to consume tracker creation AI job quota'
      );
    }
  }

  private getPolicy(purpose: TrackerCreationAIJobQuotaPurpose) {
    return purpose === 'roadmap_generation'
      ? AI_JOB_QUOTA_POLICIES.roadmapGeneration
      : AI_JOB_QUOTA_POLICIES.roadmapEvaluation;
  }
}

export const redisAIJobQuotaStore = new RedisAIJobQuotaStore();
