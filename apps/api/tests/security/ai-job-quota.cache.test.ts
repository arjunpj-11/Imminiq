import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config/redis', () => {
  let counter = 0;

  return {
    redis: {
      incr: vi.fn(async () => {
        counter += 1;
        return counter;
      }),
      expire: vi.fn(async () => 1),
      __resetCounter: () => {
        counter = 0;
      },
    },
  };
});

import { redis } from '../../src/config/redis';
import {
  AI_JOB_QUOTA_POLICIES,
  aiJobQuotaCache,
} from '../../src/infrastructure/cache/ai-job-quota.cache';

const mockedRedis = redis as typeof redis & {
  __resetCounter: () => void;
};

describe('aiJobQuotaCache', () => {
  beforeEach(() => {
    mockedRedis.__resetCounter();
  });

  it('allows requests until the hourly quota is reached', async () => {
    const first = await aiJobQuotaCache.consume(
      'roadmap_generation',
      'user-1',
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    );

    const second = await aiJobQuotaCache.consume(
      'roadmap_generation',
      'user-1',
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    );

    const third = await aiJobQuotaCache.consume(
      'roadmap_generation',
      'user-1',
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    );

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it('rejects the next request once the quota is exceeded', async () => {
    await aiJobQuotaCache.consume(
      'roadmap_generation',
      'user-1',
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    );
    await aiJobQuotaCache.consume(
      'roadmap_generation',
      'user-1',
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    );
    await aiJobQuotaCache.consume(
      'roadmap_generation',
      'user-1',
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    );

    const fourth = await aiJobQuotaCache.consume(
      'roadmap_generation',
      'user-1',
      AI_JOB_QUOTA_POLICIES.roadmapGeneration
    );

    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });
});
