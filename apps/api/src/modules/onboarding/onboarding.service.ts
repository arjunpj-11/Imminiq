import type {
  GenerateRoadmapPayload,
  GenerateRoadmapResult,
  GetEvaluationResult,
  GetJobStatusResult,
  OnboardingResponseRecord,
  OnboardingStatusResult,
  RoadmapTreeResult,
  SaveOnboardingStepOnePayload,
  SaveOnboardingStepTwoPayload,
} from './application/dtos/onboarding.dto'
import {
  OnboardingMapper,
  type OnboardingMapperContract,
} from './application/mappers/onboarding.mapper'
import {
  OnboardingJobOutputReaderService,
  type OnboardingJobOutputReaderServiceContract,
} from './application/services/onboarding-job-output-reader.service'
import { EvaluateRoadmapUseCase } from './application/use-cases/evaluate-roadmap.usecase'
import { GenerateRoadmapUseCase } from './application/use-cases/generate-roadmap.usecase'
import { GetOnboardingStatusUseCase } from './application/use-cases/get-onboarding-status.usecase'
import { GetRoadmapEvaluationResultUseCase } from './application/use-cases/get-roadmap-evaluation-result.usecase'
import { GetRoadmapJobResultUseCase } from './application/use-cases/get-roadmap-job-result.usecase'
import { GetRoadmapJobStatusUseCase } from './application/use-cases/get-roadmap-job-status.usecase'
import { SaveOnboardingStepOneUseCase } from './application/use-cases/save-onboarding-step-one.usecase'
import { SaveOnboardingStepTwoUseCase } from './application/use-cases/save-onboarding-step-two.usecase'
import type { OnboardingRepositoryContract } from './domain/repositories/onboarding.repository.interface'
import type { AIJobQueueGatewayContract } from './domain/services/ai-job-queue.interface'
import type { AIJobQuotaStoreContract } from './domain/services/ai-job-quota-store.interface'
import { bullMqAIJobQueueGateway } from './infrastructure/gateways/bullmq-ai-job-queue.gateway'
import { mongoOnboardingRepository } from './infrastructure/repositories/mongo-onboarding.repository'
import { redisAIJobQuotaStore } from './infrastructure/stores/redis-ai-job-quota.store'

export class OnboardingService {
  private readonly getOnboardingStatusUseCase: GetOnboardingStatusUseCase
  private readonly saveOnboardingStepOneUseCase: SaveOnboardingStepOneUseCase
  private readonly saveOnboardingStepTwoUseCase: SaveOnboardingStepTwoUseCase
  private readonly generateRoadmapUseCase: GenerateRoadmapUseCase
  private readonly getRoadmapJobStatusUseCase: GetRoadmapJobStatusUseCase
  private readonly getRoadmapJobResultUseCase: GetRoadmapJobResultUseCase
  private readonly evaluateRoadmapUseCase: EvaluateRoadmapUseCase
  private readonly getRoadmapEvaluationResultUseCase: GetRoadmapEvaluationResultUseCase

  constructor(
    private readonly onboardingRepository: OnboardingRepositoryContract,
    private readonly aiJobQueueGateway: AIJobQueueGatewayContract,
    private readonly aiJobQuotaStore: AIJobQuotaStoreContract,
    private readonly onboardingMapper: OnboardingMapperContract,
    private readonly onboardingJobOutputReader: OnboardingJobOutputReaderServiceContract,
  ) {
    this.getOnboardingStatusUseCase = new GetOnboardingStatusUseCase(
      this.onboardingRepository,
      this.onboardingMapper,
    )

    this.saveOnboardingStepOneUseCase = new SaveOnboardingStepOneUseCase(
      this.onboardingRepository,
      this.onboardingMapper,
    )

    this.saveOnboardingStepTwoUseCase = new SaveOnboardingStepTwoUseCase(
      this.onboardingRepository,
      this.onboardingMapper,
    )

    this.generateRoadmapUseCase = new GenerateRoadmapUseCase(
      this.onboardingRepository,
      this.aiJobQueueGateway,
      this.aiJobQuotaStore,
    )

    this.getRoadmapJobStatusUseCase = new GetRoadmapJobStatusUseCase(
      this.onboardingRepository,
      this.onboardingMapper,
      this.onboardingJobOutputReader,
    )

    this.getRoadmapJobResultUseCase = new GetRoadmapJobResultUseCase(
      this.onboardingRepository,
      this.onboardingMapper,
      this.onboardingJobOutputReader,
    )

    this.evaluateRoadmapUseCase = new EvaluateRoadmapUseCase(
      this.onboardingRepository,
      this.aiJobQueueGateway,
      this.aiJobQuotaStore,
      this.onboardingJobOutputReader,
    )

    this.getRoadmapEvaluationResultUseCase =
      new GetRoadmapEvaluationResultUseCase(
        this.onboardingRepository,
        this.onboardingJobOutputReader,
      )
  }

  getStatus(userId: string): Promise<OnboardingStatusResult> {
    return this.getOnboardingStatusUseCase.execute(userId)
  }

  saveStep1(
    userId: string,
    payload: SaveOnboardingStepOnePayload,
  ): Promise<OnboardingResponseRecord | null> {
    return this.saveOnboardingStepOneUseCase.execute(userId, payload)
  }

  saveStep2(
    userId: string,
    payload: SaveOnboardingStepTwoPayload,
  ): Promise<OnboardingResponseRecord | null> {
    return this.saveOnboardingStepTwoUseCase.execute(userId, payload)
  }

  generateRoadmap(
    userId: string,
    payload: GenerateRoadmapPayload,
  ): Promise<GenerateRoadmapResult> {
    return this.generateRoadmapUseCase.execute(userId, payload)
  }

  getJobStatus(
    jobId: string,
    userId: string,
  ): Promise<GetJobStatusResult> {
    return this.getRoadmapJobStatusUseCase.execute(jobId, userId)
  }

  getJobResult(
    jobId: string,
    userId: string,
  ): Promise<RoadmapTreeResult> {
    return this.getRoadmapJobResultUseCase.execute(jobId, userId)
  }

  evaluateRoadmap(
    roadmapJobId: string,
    userId: string,
  ): Promise<GenerateRoadmapResult> {
    return this.evaluateRoadmapUseCase.execute(roadmapJobId, userId)
  }

  getEvaluationResult(
    jobId: string,
    userId: string,
  ): Promise<GetEvaluationResult> {
    return this.getRoadmapEvaluationResultUseCase.execute(jobId, userId)
  }
}

const onboardingRepository = mongoOnboardingRepository
const aiJobQueueGateway = bullMqAIJobQueueGateway
const aiJobQuotaStore = redisAIJobQuotaStore
const onboardingMapper = new OnboardingMapper()
const onboardingJobOutputReader = new OnboardingJobOutputReaderService()

export const onboardingService = new OnboardingService(
  onboardingRepository,
  aiJobQueueGateway,
  aiJobQuotaStore,
  onboardingMapper,
  onboardingJobOutputReader,
)
