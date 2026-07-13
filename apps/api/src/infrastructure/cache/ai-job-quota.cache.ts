import { redis } from '../../config/redis';

export type AIQuotaKind = 'roadmap_generation' | 'roadmap_evaluation';

export type AIQuotaPolicy = {
  maxPerWindow: number;
  windowSeconds: number;
};

export const AI_JOB_QUOTA_POLICIES = {
  roadmapGeneration: {
    maxPerWindow: 3,
    windowSeconds: 60 * 60,
  },
  roadmapEvaluation: {
    maxPerWindow: 10,
    windowSeconds: 60 * 60,
  },
} satisfies Record<string, AIQuotaPolicy>;

const keyFor = (kind: AIQuotaKind, userId: string) => {
  return `ai-job-quota:${kind}:${userId}`;
};

export const aiJobQuotaCache = {
  async consume(
    kind: AIQuotaKind,
    userId: string,
    policy: AIQuotaPolicy
  ): Promise<{
    allowed: boolean;
    used: number;
    remaining: number;
  }> {
    const key = keyFor(kind, userId);
    const used = await redis.incr(key);

    if (used === 1) {
      await redis.expire(key, policy.windowSeconds);
    }

    return {
      allowed: used <= policy.maxPerWindow,
      used,
      remaining: Math.max(policy.maxPerWindow - used, 0),
    };
  },
};
