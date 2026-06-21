import { ROADMAP_GENERATION_STEPS } from '../constants/onboarding.constants'
import type { OnboardingAIJobCommandRepositoryContract } from '../../domain/repositories/onboarding-ai-job-command.repository.interface'
import type { OnboardingAIJobQueryRepositoryContract } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { OnboardingResponseCommandRepositoryContract } from '../../domain/repositories/onboarding-response-command.repository.interface'
import type { AIJobQueueGatewayContract } from '../../domain/services/ai-job-queue.interface'
import type { AIJobQuotaStoreContract } from '../../domain/services/ai-job-quota-store.interface'
import type {
  GenerateRoadmapPayload,
  GenerateRoadmapResult,
} from '../dtos/onboarding.dto'
import { OnboardingApplicationError } from '../errors/onboarding-application.error'

type GenerateRoadmapRepository =
  OnboardingAIJobQueryRepositoryContract &
  OnboardingAIJobCommandRepositoryContract &
  OnboardingResponseCommandRepositoryContract

export class GenerateRoadmapUseCase {
  constructor(
    private readonly onboardingRepository: GenerateRoadmapRepository,
    private readonly aiJobQueueGateway: AIJobQueueGatewayContract,
    private readonly aiJobQuotaStore: AIJobQuotaStoreContract,
  ) {}

  async execute(
    userId: string,
    payload: GenerateRoadmapPayload,
  ): Promise<GenerateRoadmapResult> {
    const activeRoadmapJob =
      await this.onboardingRepository.findActiveRoadmapJobForUser(userId)

    if (activeRoadmapJob) {
      throw OnboardingApplicationError.roadmapJobAlreadyActive()
    }

    const quota = await this.aiJobQuotaStore.consume(
      'roadmap_generation',
      userId,
    )

    if (!quota.allowed) {
      throw OnboardingApplicationError.roadmapGenerationQuotaExceeded()
    }

    await this.onboardingRepository.saveStep1({
      userId,
      topic: payload.topic,
      goal: payload.goal,
    })

    await this.onboardingRepository.saveStep2({
      userId,
      level: payload.level,
    })

    const aiJob = await this.onboardingRepository.createAIJob({
      userId,
      inputData: {
        topic: payload.topic,
        ...(payload.goal ? { goal: payload.goal } : {}),
        level: payload.level,
      },
    })

    await this.onboardingRepository.createAIJobSteps({
      jobId: aiJob.id,
      stepLabels: ROADMAP_GENERATION_STEPS,
    })

    try {
      await this.aiJobQueueGateway.enqueueRoadmapGeneration({
        jobId: aiJob.id,
        userId,
        topic: payload.topic,
        ...(payload.goal ? { goal: payload.goal } : {}),
        level: payload.level,
      })
    } catch (error) {
      throw OnboardingApplicationError.aiQueueError(
        error instanceof Error
          ? error.message
          : 'Failed to enqueue AI roadmap generation job',
      )
    }

    return { jobId: aiJob.id }
  }
}