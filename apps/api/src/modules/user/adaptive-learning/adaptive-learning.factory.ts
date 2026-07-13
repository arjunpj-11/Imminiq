import type { IGenerateMockTestUseCase } from '../mock-tests'
import type { AdaptiveLearningUseCases } from './application/adaptive-learning-use-cases.contract'
import { AdaptiveLearningMapper } from './application/adaptive-learning.mapper'
import { ChatWithAdaptiveAdvisorUseCase } from './application/use-cases/chat-with-adaptive-advisor.usecase'
import { GenerateAdaptiveAssessmentUseCase } from './application/use-cases/generate-adaptive-assessment.usecase'
import { GetAdaptiveLearningDashboardUseCase } from './application/use-cases/get-adaptive-learning-dashboard.usecase'
import type { IAdaptiveLearningRepository } from './domain/repositories/adaptive-learning.repository.interface'
import { AdaptiveTestGeneratorGateway } from './infrastructure/gateways/adaptive-test-generator.gateway'
import { mongoAdaptiveLearningRepository } from './infrastructure/repositories/internal/mongo-adaptive-learning.repository'
import { LangChainAdaptiveLearningAgent } from './infrastructure/services/langchain-adaptive-learning-agent.service'

export type AdaptiveLearningServiceHelpers = {
  adaptiveLearningRepository: IAdaptiveLearningRepository
}

export type AdaptiveLearningComposition = {
  useCases: AdaptiveLearningUseCases
  helpers: AdaptiveLearningServiceHelpers
}

export const createAdaptiveLearningComposition = (
  generateMockTest: IGenerateMockTestUseCase,
) : AdaptiveLearningComposition => {
  const repository = mongoAdaptiveLearningRepository
  const agent = new LangChainAdaptiveLearningAgent()
  const testGenerator = new AdaptiveTestGeneratorGateway(generateMockTest)
  const mapper = new AdaptiveLearningMapper()

  return {
    useCases: {
      getDashboard: new GetAdaptiveLearningDashboardUseCase(repository, mapper),
      generateAssessment: new GenerateAdaptiveAssessmentUseCase(
        repository,
        agent,
        testGenerator,
        mapper,
      ),
      chatWithAdvisor: new ChatWithAdaptiveAdvisorUseCase(
        repository,
        agent,
        mapper,
      ),
    },
    helpers: { adaptiveLearningRepository: repository },
  }
}
