import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SaveGeneratedRoadmapUseCase } from '../../src/modules/user/onboarding/application/use-cases/save-generated-roadmap.usecase';
import type { ITrackerRepository } from '../../src/modules/user/trackers/domain/repositories/tracker.repository.interface';
import type { IOnboardingRepository } from '../../src/modules/user/onboarding/domain/repositories/onboarding.repository.interface';

describe('SaveGeneratedRoadmapUseCase', () => {
  let trackerRepository: Partial<ITrackerRepository> & Record<string, any>;
  let onboardingRepository: Partial<IOnboardingRepository> & Record<string, any>;
  let subscriptionLimitService: Record<string, any> | undefined;
  let createNotificationUseCase: Record<string, any> | undefined;

  beforeEach(() => {
    trackerRepository = {
      createTrackerWithNestedContent: vi.fn().mockResolvedValue({ trackerId: 'tracker-123' }),
    } as unknown as ITrackerRepository;

    onboardingRepository = {
      updateJobStatus: vi.fn().mockResolvedValue(true),
    } as unknown as IOnboardingRepository;

    subscriptionLimitService = {
      enforceUsageLimitForUser: vi.fn().mockResolvedValue(true),
    };

    createNotificationUseCase = {
      execute: vi.fn().mockResolvedValue(true),
    };
  });

  it('creates tracker, updates job and sends notification when jobId provided', async () => {
    const usecase = new SaveGeneratedRoadmapUseCase(
      onboardingRepository as IOnboardingRepository,
      trackerRepository as ITrackerRepository,
      subscriptionLimitService,
      createNotificationUseCase
    );

    const input = {
      userId: 'user-1',
      title: 'Learn TypeScript',
      slug: 'learn-typescript',
      description: 'Auto-generated roadmap',
      domain: 'web',
      goal: 'Become proficient',
      level: 'beginner' as const,
      isAIGenerated: true,
      aiJobId: 'ai-job-1',
      topics: [
        { order: 1, title: 'Basics', children: [] },
        { order: 2, title: 'Advanced', children: [] },
      ],
      jobId: 'job-1',
    };

    const result = await usecase.execute(input);

    expect(trackerRepository.createTrackerWithNestedContent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: input.userId,
        title: input.title,
        slug: input.slug,
        level: input.level,
        topics: input.topics,
        aiJobId: input.aiJobId,
      })
    );

    expect(onboardingRepository.updateJobStatus).toHaveBeenCalledWith({
      jobId: input.jobId,
      status: 'completed',
      output: { trackerId: 'tracker-123' },
    });

    expect(createNotificationUseCase.execute).toHaveBeenCalledWith({
      userId: input.userId,
      type: 'ai:roadmap:generated',
      payload: { trackerId: 'tracker-123', title: input.title },
    });

    expect(result).toEqual({ trackerId: 'tracker-123' });
  });

  it('enforces subscription limits when service is provided', async () => {
    const usecase = new SaveGeneratedRoadmapUseCase(
      onboardingRepository as IOnboardingRepository,
      trackerRepository as ITrackerRepository,
      subscriptionLimitService,
      undefined
    );

    const input = {
      userId: 'user-2',
      title: 'Some Roadmap',
      slug: 'some-roadmap',
      level: 'intermediate' as const,
      topics: [],
    } as any;

    await usecase.execute(input);

    expect(subscriptionLimitService!.enforceUsageLimitForUser).toHaveBeenCalledWith(
      'user-2',
      'trackers'
    );

    expect(trackerRepository.createTrackerWithNestedContent).toHaveBeenCalled();
  });

  it('works even if optional services are not provided', async () => {
    const usecase = new SaveGeneratedRoadmapUseCase(
      ({} as unknown) as IOnboardingRepository,
      trackerRepository as ITrackerRepository,
      undefined,
      undefined
    );

    const input = {
      userId: 'user-3',
      title: 'No Extras',
      slug: 'no-extras',
      level: 'advanced' as const,
      topics: [],
    } as any;

    const result = await usecase.execute(input);

    expect(result).toEqual({ trackerId: 'tracker-123' });
  });
});
