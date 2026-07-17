import type { IOnboardingRepository } from '../../domain/repositories/onboarding.repository.interface';
import type { ITrackerRepository } from '../../../trackers';

export interface ISaveGeneratedRoadmapUseCase {
  execute(input: {
    userId: string;
    title: string;
    slug: string;
    description?: string;
    domain?: string;
    goal?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    isAIGenerated?: boolean;
    aiJobId?: string;
    topics: Array<any>;
    jobId?: string;
  }): Promise<{ trackerId: string }>;
}

export class SaveGeneratedRoadmapUseCase implements ISaveGeneratedRoadmapUseCase {
  constructor(
    private readonly onboardingRepository: IOnboardingRepository,
    private readonly trackerRepository: ITrackerRepository,
    private readonly subscriptionLimitService: any,
    private readonly createNotificationUseCase: any
  ) {}

  async execute(input: {
    userId: string;
    title: string;
    slug: string;
    description?: string;
    domain?: string;
    goal?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    isAIGenerated?: boolean;
    aiJobId?: string;
    topics: Array<any>;
    jobId?: string;
  }): Promise<{ trackerId: string }> {
    // Enforce subscription limits (if applicable)
    if (this.subscriptionLimitService) {
      await this.subscriptionLimitService.enforceUsageLimitForUser?.(input.userId, 'trackers');
    }

    // Delegate creation to the tracker repository which implements transactional creation
    const { trackerId } = await this.trackerRepository.createTrackerWithNestedContent({
      userId: input.userId,
      title: input.title,
      slug: input.slug,
      description: input.description,
      domain: input.domain,
      goal: input.goal,
      level: input.level,
      isAIGenerated: Boolean(input.isAIGenerated),
      aiJobId: input.aiJobId,
      topics: input.topics,
    });

    // Update AI generation job status if jobId provided
    if (input.jobId) {
      await this.onboardingRepository.updateJobStatus?.({
        jobId: input.jobId,
        status: 'completed',
        output: { trackerId },
      });
    }

    // Send a notification about completion
    if (this.createNotificationUseCase) {
      await this.createNotificationUseCase.execute?.({
        userId: input.userId,
        type: 'ai:roadmap:generated',
        payload: {
          trackerId,
          title: input.title,
        },
      });
    }

    return { trackerId };
  }
}

export const createSaveGeneratedRoadmapUseCase = (deps: {
  onboardingRepository: IOnboardingRepository;
  trackerRepository: ITrackerRepository;
  subscriptionLimitService?: any;
  createNotificationUseCase?: any;
}) => new SaveGeneratedRoadmapUseCase(deps.onboardingRepository, deps.trackerRepository, deps.subscriptionLimitService, deps.createNotificationUseCase);
