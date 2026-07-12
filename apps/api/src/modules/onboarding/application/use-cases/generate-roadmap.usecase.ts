import { ROADMAP_GENERATION_STEPS } from '../onboarding.constants'
import type { IOnboardingAIJobCommandRepository } from '../../domain/repositories/onboarding-ai-job-command.repository.interface'
import type { IOnboardingAIJobQueryRepository } from '../../domain/repositories/onboarding-ai-job-query.repository.interface'
import type { IOnboardingResponseCommandRepository } from '../../domain/repositories/onboarding-response-command.repository.interface'
import type { IAIJobQueueGateway } from '../../domain/services/ai-job-queue.interface'
import type { IAIJobQuotaStore } from '../../domain/services/ai-job-quota-store.interface'
import type {
  IGenerateRoadmapPayloadDTO,
  IGenerateRoadmapResultDTO,
} from '../onboarding.dto'
import { OnboardingApplicationError } from '../onboarding-application.error'

type GenerateRoadmapRepository =
  IOnboardingAIJobQueryRepository &
  IOnboardingAIJobCommandRepository &
  IOnboardingResponseCommandRepository

export interface IGenerateRoadmapUseCase {
  execute(userId: string, payload: IGenerateRoadmapPayloadDTO): Promise<IGenerateRoadmapResultDTO>
}

export class GenerateRoadmapUseCase implements IGenerateRoadmapUseCase {
  constructor(
    private readonly _onboardingRepository: GenerateRoadmapRepository,
    private readonly _aiJobQueueGateway: IAIJobQueueGateway,
    private readonly _aiJobQuotaStore: IAIJobQuotaStore,
  ) {}

  async execute(
    userId: string,
    payload: IGenerateRoadmapPayloadDTO,
  ): Promise<IGenerateRoadmapResultDTO> {
    const activeRoadmapJob =
      await this._onboardingRepository.findActiveRoadmapJobForUser(userId)

    if (activeRoadmapJob) {
      throw OnboardingApplicationError.roadmapJobAlreadyActive()
    }

    const quota = await this._aiJobQuotaStore.consume(
      'roadmap_generation',
      userId,
    )

    if (!quota.allowed) {
      throw OnboardingApplicationError.roadmapGenerationQuotaExceeded()
    }

    await this._onboardingRepository.saveStep1({
      userId,
      topic: payload.topic,
      goal: payload.goal,
    })

    await this._onboardingRepository.saveStep2({
      userId,
      level: payload.level,
    })

    const aiJob = await this._onboardingRepository.createAIJob({
      userId,
      inputData: {
        topic: payload.topic,
        ...(payload.goal ? { goal: payload.goal } : {}),
        level: payload.level,
      },
    })

    await this._onboardingRepository.createAIJobSteps({
      jobId: aiJob.id,
      stepLabels: ROADMAP_GENERATION_STEPS,
    })

    try {
      await this._aiJobQueueGateway.enqueueRoadmapGeneration({
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