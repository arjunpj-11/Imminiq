import type { OnboardingUseCases } from './application/contracts/onboarding-use-cases.contract'
import {
  OnboardingMapper,
  type IOnboardingMapper,
} from './application/mappers/onboarding.mapper'
import {
  OnboardingJobOutputReader,
  type IOnboardingJobOutputReader,
} from './application/services/onboarding-job-output-reader.service'
import { EvaluateRoadmapUseCase } from './application/use-cases/evaluate-roadmap.usecase'
import { GenerateRoadmapUseCase } from './application/use-cases/generate-roadmap.usecase'
import { GetOnboardingStatusUseCase } from './application/use-cases/get-onboarding-status.usecase'
import { GetRoadmapEvaluationResultUseCase } from './application/use-cases/get-roadmap-evaluation-result.usecase'
import { GetRoadmapJobResultUseCase } from './application/use-cases/get-roadmap-job-result.usecase'
import { GetRoadmapJobStatusUseCase } from './application/use-cases/get-roadmap-job-status.usecase'
import { SaveOnboardingStepOneUseCase } from './application/use-cases/save-onboarding-step-one.usecase'
import { SaveOnboardingStepTwoUseCase } from './application/use-cases/save-onboarding-step-two.usecase'
import type { IAIJobQueueGateway } from './domain/services/ai-job-queue.interface'
import type { IAIJobQuotaStore } from './domain/services/ai-job-quota-store.interface'
import { bullMqAIJobQueueGateway } from './infrastructure/gateways/bullmq-ai-job-queue.gateway'
import { mongoOnboardingRepository } from './infrastructure/repositories/mongo-onboarding.repository'
import { redisAIJobQuotaStore } from './infrastructure/stores/redis-ai-job-quota.store'


export type OnboardingServiceHelpers = {
  onboardingAIJobQueueGateway: IAIJobQueueGateway
  onboardingAIJobQuotaStore: IAIJobQuotaStore
  onboardingMapper: IOnboardingMapper
  onboardingJobOutputReader: IOnboardingJobOutputReader
}

export type OnboardingComposition = {
  useCases: OnboardingUseCases
  helpers: OnboardingServiceHelpers
}

export const createOnboardingComposition = (): OnboardingComposition => {
  const onboardingRepository = mongoOnboardingRepository
  const onboardingAIJobQueueGateway = bullMqAIJobQueueGateway
  const onboardingAIJobQuotaStore = redisAIJobQuotaStore
  const onboardingMapper = new OnboardingMapper()
  const onboardingJobOutputReader = new OnboardingJobOutputReader()

  return {
    useCases: {
      getOnboardingStatus: new GetOnboardingStatusUseCase(
        onboardingRepository,
        onboardingMapper
      ),

      saveOnboardingStepOne: new SaveOnboardingStepOneUseCase(
        onboardingRepository,
        onboardingMapper
      ),

      saveOnboardingStepTwo: new SaveOnboardingStepTwoUseCase(
        onboardingRepository,
        onboardingMapper
      ),

      generateRoadmap: new GenerateRoadmapUseCase(
        onboardingRepository,
        onboardingAIJobQueueGateway,
        onboardingAIJobQuotaStore
      ),

      getRoadmapJobStatus: new GetRoadmapJobStatusUseCase(
        onboardingRepository,
        onboardingMapper,
        onboardingJobOutputReader
      ),

      getRoadmapJobResult: new GetRoadmapJobResultUseCase(
        onboardingRepository,
        onboardingMapper,
        onboardingJobOutputReader
      ),

      evaluateRoadmap: new EvaluateRoadmapUseCase(
        onboardingRepository,
        onboardingAIJobQueueGateway,
        onboardingAIJobQuotaStore,
        onboardingJobOutputReader
      ),

      getRoadmapEvaluationResult:
        new GetRoadmapEvaluationResultUseCase(
          onboardingRepository,
          onboardingJobOutputReader
        ),
    },

    helpers: {
      onboardingAIJobQueueGateway,
      onboardingAIJobQuotaStore,
      onboardingMapper,
      onboardingJobOutputReader,
    },
  }
}