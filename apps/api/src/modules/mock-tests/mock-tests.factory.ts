import {
  MockTestsMapper,
  type MockTestsMapperContract,
} from './application/mappers/mock-tests.mapper'
import {
  MockTestScoringService,
  type MockTestScoringServiceContract,
} from './application/services/test-scorer.service'
import { CreateMockTestUseCase } from './application/use-cases/create-mock-test.usecase'
import { FinishTestAttemptUseCase } from './application/use-cases/finish-test-attempt.usecase'
import { FlagQuestionUseCase } from './application/use-cases/flag-question.usecase'
import { GenerateMockTestUseCase } from './application/use-cases/generate-mock-test.usecase'
import { GetAIInsightsUseCase } from './application/use-cases/get-ai-insights.usecase'
import { GetAnalyticsUseCase } from './application/use-cases/get-analytics.usecase'
import { GetAttemptAnalysisUseCase } from './application/use-cases/get-attempt-analysis.usecase'
import { GetAttemptQuestionsUseCase } from './application/use-cases/get-attempt-questions.usecase'
import { GetAttemptResultUseCase } from './application/use-cases/get-attempt-result.usecase'
import { GetHistoryUseCase } from './application/use-cases/get-history.usecase'
import { GetMockTestDetailsUseCase } from './application/use-cases/get-mock-test-details.usecase'
import { GetTopicBreakdownUseCase } from './application/use-cases/get-topic-breakdown.usecase'
import { ImportSharedMockTestUseCase } from './application/use-cases/import-shared-mock-test.usecase'
import { ListMockTestsUseCase } from './application/use-cases/list-mock-tests.usecase'
import { ListPublicMockTestsUseCase } from './application/use-cases/list-public-mock-tests.usecase'
import { RetakeTestUseCase } from './application/use-cases/retake-test.usecase'
import { RunMockTestCodeUseCase } from './application/use-cases/run-mock-test-code.usecase'
import { ShareMockTestUseCase } from './application/use-cases/share-mock-test.usecase'
import { StartTestAttemptUseCase } from './application/use-cases/start-test-attempt.usecase'
import { SubmitAnswerUseCase } from './application/use-cases/submit-answer.usecase'
import { SubmitMockTestCodeUseCase } from './application/use-cases/submit-mock-test-code.usecase'

import type { MockTestAIServiceContract } from './domain/services/mock-test-ai.service.interface'
import type { MockTestCodeRunnerServiceContract } from './domain/services/mock-test-code-runner.service.interface'
import type { MockTestQuestionBankServiceContract } from './domain/services/mock-test-question-bank.service.interface'
import type { ShareTokenGeneratorServiceContract } from './domain/services/share-token-generator.service.interface'

import { mongoMockTestsRepository } from './infrastructure/repositories/mongo-mock-tests.repository'
import { cryptoShareTokenGeneratorService } from './infrastructure/services/crypto-share-token-generator.service'
import { geminiGroqMockTestAIService } from './infrastructure/services/gemini-groq-mock-test-ai.service'
import { mongoQuestionBankService } from './infrastructure/services/mongo-question-bank.service'
import { pistonMockTestCodeRunnerService } from './infrastructure/services/piston-mock-test-code-runner.service'

export type MockTestsUseCases = {
  listMockTests: ListMockTestsUseCase
  listPublicMockTests: ListPublicMockTestsUseCase
  getMockTestDetails: GetMockTestDetailsUseCase
  createMockTest: CreateMockTestUseCase
  generateMockTest: GenerateMockTestUseCase
  startTestAttempt: StartTestAttemptUseCase
  getAttemptQuestions: GetAttemptQuestionsUseCase
  submitAnswer: SubmitAnswerUseCase
  flagQuestion: FlagQuestionUseCase
  finishTestAttempt: FinishTestAttemptUseCase
  getAttemptResult: GetAttemptResultUseCase
  getAttemptAnalysis: GetAttemptAnalysisUseCase
  retakeTest: RetakeTestUseCase
  getAnalytics: GetAnalyticsUseCase
  getAIInsights: GetAIInsightsUseCase
  getHistory: GetHistoryUseCase
  getTopicBreakdown: GetTopicBreakdownUseCase
  shareMockTest: ShareMockTestUseCase
  importSharedMockTest: ImportSharedMockTestUseCase
  runMockTestCode: RunMockTestCodeUseCase
  submitMockTestCode: SubmitMockTestCodeUseCase
}

export type MockTestsServiceHelpers = {
  mockTestsMapper: MockTestsMapperContract
  mockTestScoringService: MockTestScoringServiceContract
  mockTestAIService: MockTestAIServiceContract
  mockTestQuestionBankService: MockTestQuestionBankServiceContract
  mockTestCodeRunnerService: MockTestCodeRunnerServiceContract
  shareTokenGenerator: ShareTokenGeneratorServiceContract
}

export type MockTestsComposition = {
  useCases: MockTestsUseCases
  helpers: MockTestsServiceHelpers
}

export const createMockTestsComposition = (): MockTestsComposition => {
  const mockTestsRepository = mongoMockTestsRepository
  const mockTestAIService = geminiGroqMockTestAIService
  const mockTestQuestionBankService = mongoQuestionBankService
  const mockTestCodeRunnerService = pistonMockTestCodeRunnerService
  const mockTestsMapper = new MockTestsMapper()
  const mockTestScoringService = new MockTestScoringService()
  const shareTokenGenerator = cryptoShareTokenGeneratorService

  return {
    useCases: {
      listMockTests: new ListMockTestsUseCase(
        mockTestsRepository,
        mockTestsMapper
      ),

      listPublicMockTests: new ListPublicMockTestsUseCase(
        mockTestsRepository
      ),

      getMockTestDetails: new GetMockTestDetailsUseCase(
        mockTestsRepository,
        mockTestsMapper
      ),

      createMockTest: new CreateMockTestUseCase(
        mockTestsRepository
      ),

      generateMockTest: new GenerateMockTestUseCase(
        mockTestsRepository,
        mockTestAIService,
        mockTestQuestionBankService
      ),

      startTestAttempt: new StartTestAttemptUseCase(
        mockTestsRepository,
        mockTestsMapper
      ),

      getAttemptQuestions: new GetAttemptQuestionsUseCase(
        mockTestsRepository,
        mockTestsMapper
      ),

      submitAnswer: new SubmitAnswerUseCase(
        mockTestsRepository,
        mockTestAIService,
        mockTestScoringService
      ),

      flagQuestion: new FlagQuestionUseCase(
        mockTestsRepository
      ),

      finishTestAttempt: new FinishTestAttemptUseCase(
        mockTestsRepository,
        mockTestScoringService
      ),

      getAttemptResult: new GetAttemptResultUseCase(
        mockTestsRepository
      ),

      getAttemptAnalysis: new GetAttemptAnalysisUseCase(
        mockTestsRepository
      ),

      retakeTest: new RetakeTestUseCase(
        mockTestsRepository,
        mockTestsMapper
      ),

      getAnalytics: new GetAnalyticsUseCase(
        mockTestsRepository,
        mockTestAIService
      ),

      getAIInsights: new GetAIInsightsUseCase(
        mockTestsRepository,
        mockTestAIService
      ),

      getHistory: new GetHistoryUseCase(
        mockTestsRepository
      ),

      getTopicBreakdown: new GetTopicBreakdownUseCase(
        mockTestsRepository
      ),

      shareMockTest: new ShareMockTestUseCase(
        mockTestsRepository,
        shareTokenGenerator
      ),

      importSharedMockTest: new ImportSharedMockTestUseCase(
        mockTestsRepository
      ),

      runMockTestCode: new RunMockTestCodeUseCase(
        mockTestsRepository,
        mockTestCodeRunnerService
      ),

      submitMockTestCode: new SubmitMockTestCodeUseCase(
        mockTestsRepository,
        mockTestCodeRunnerService
      ),
    },

    helpers: {
      mockTestsMapper,
      mockTestScoringService,
      mockTestAIService,
      mockTestQuestionBankService,
      mockTestCodeRunnerService,
      shareTokenGenerator,
    },
  }
}