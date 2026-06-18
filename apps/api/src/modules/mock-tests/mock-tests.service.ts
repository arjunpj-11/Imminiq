import type {
  CreateMockTestPayload,
  DifficultyLevel,
  GenerateMockTestPayload,
  RunMockTestCodePayload,
  SubmitAnswerPayload,
  SubmitMockTestCodePayload,
} from './application/dtos/mock-tests.dto'
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
import type { MockTestsRepositoryContract } from './domain/repositories/mock-tests.repository.interface'
import type { MockTestAIServiceContract } from './domain/services/mock-test-ai.service.interface'
import type { MockTestCodeRunnerServiceContract } from './domain/services/mock-test-code-runner.service.interface'
import type { MockTestQuestionBankServiceContract } from './domain/services/mock-test-question-bank.service.interface'
import type { ShareTokenGeneratorServiceContract } from './domain/services/share-token-generator.service.interface'
import { mongoMockTestsRepository } from './infrastructure/repositories/mongo-mock-tests.repository'
import { cryptoShareTokenGeneratorService } from './infrastructure/services/crypto-share-token-generator.service'
import { geminiGroqMockTestAIService } from './infrastructure/services/gemini-groq-mock-test-ai.service'
import { mongoQuestionBankService } from './infrastructure/services/mongo-question-bank.service'
import { pistonMockTestCodeRunnerService } from './infrastructure/services/piston-mock-test-code-runner.service'

export class MockTestsService {
  private readonly listMockTestsUseCase: ListMockTestsUseCase
  private readonly listPublicMockTestsUseCase: ListPublicMockTestsUseCase
  private readonly getMockTestDetailsUseCase: GetMockTestDetailsUseCase
  private readonly createMockTestUseCase: CreateMockTestUseCase
  private readonly generateMockTestUseCase: GenerateMockTestUseCase
  private readonly startTestAttemptUseCase: StartTestAttemptUseCase
  private readonly getAttemptQuestionsUseCase: GetAttemptQuestionsUseCase
  private readonly submitAnswerUseCase: SubmitAnswerUseCase
  private readonly flagQuestionUseCase: FlagQuestionUseCase
  private readonly finishTestAttemptUseCase: FinishTestAttemptUseCase
  private readonly getAttemptResultUseCase: GetAttemptResultUseCase
  private readonly getAttemptAnalysisUseCase: GetAttemptAnalysisUseCase
  private readonly retakeTestUseCase: RetakeTestUseCase
  private readonly getAnalyticsUseCase: GetAnalyticsUseCase
  private readonly getAIInsightsUseCase: GetAIInsightsUseCase
  private readonly getHistoryUseCase: GetHistoryUseCase
  private readonly getTopicBreakdownUseCase: GetTopicBreakdownUseCase
  private readonly shareMockTestUseCase: ShareMockTestUseCase
  private readonly importSharedMockTestUseCase: ImportSharedMockTestUseCase
  private readonly runMockTestCodeUseCase: RunMockTestCodeUseCase
  private readonly submitMockTestCodeUseCase: SubmitMockTestCodeUseCase

  constructor(
    private readonly repository: MockTestsRepositoryContract,
    private readonly aiService: MockTestAIServiceContract,
    private readonly questionBankService: MockTestQuestionBankServiceContract,
    private readonly codeRunner: MockTestCodeRunnerServiceContract,
    private readonly mapper: MockTestsMapperContract,
    private readonly scoringService: MockTestScoringServiceContract,
    private readonly shareTokenGenerator: ShareTokenGeneratorServiceContract,
  ) {
    this.listMockTestsUseCase = new ListMockTestsUseCase(this.repository, this.mapper)
    this.listPublicMockTestsUseCase = new ListPublicMockTestsUseCase(this.repository)
    this.getMockTestDetailsUseCase = new GetMockTestDetailsUseCase(this.repository, this.mapper)
    this.createMockTestUseCase = new CreateMockTestUseCase(this.repository)
    this.generateMockTestUseCase = new GenerateMockTestUseCase(
      this.repository,
      this.aiService,
      this.questionBankService,
    )
    this.startTestAttemptUseCase = new StartTestAttemptUseCase(this.repository, this.mapper)
    this.getAttemptQuestionsUseCase = new GetAttemptQuestionsUseCase(this.repository, this.mapper)
    this.submitAnswerUseCase = new SubmitAnswerUseCase(
      this.repository,
      this.aiService,
      this.scoringService,
    )
    this.flagQuestionUseCase = new FlagQuestionUseCase(this.repository)
    this.finishTestAttemptUseCase = new FinishTestAttemptUseCase(
      this.repository,
      this.scoringService,
    )
    this.getAttemptResultUseCase = new GetAttemptResultUseCase(this.repository)
    this.getAttemptAnalysisUseCase = new GetAttemptAnalysisUseCase(this.repository)
    this.retakeTestUseCase = new RetakeTestUseCase(this.repository, this.mapper)
    this.getAnalyticsUseCase = new GetAnalyticsUseCase(this.repository, this.aiService)
    this.getAIInsightsUseCase = new GetAIInsightsUseCase(this.repository, this.aiService)
    this.getHistoryUseCase = new GetHistoryUseCase(this.repository)
    this.getTopicBreakdownUseCase = new GetTopicBreakdownUseCase(this.repository)
    this.shareMockTestUseCase = new ShareMockTestUseCase(
      this.repository,
      this.shareTokenGenerator,
    )
    this.importSharedMockTestUseCase = new ImportSharedMockTestUseCase(this.repository)
    this.runMockTestCodeUseCase = new RunMockTestCodeUseCase(
      this.repository,
      this.codeRunner,
    )
    this.submitMockTestCodeUseCase = new SubmitMockTestCodeUseCase(
      this.repository,
      this.codeRunner,
    )
  }

  listTests(userId: string, options?: { page?: number; limit?: number }) {
    return this.listMockTestsUseCase.execute(userId, options)
  }

  listPublicTests(filters: {
    difficulty?: DifficultyLevel
    tags?: string[]
    page?: number
    limit?: number
  }) {
    return this.listPublicMockTestsUseCase.execute(filters)
  }

  createTest(userId: string, payload: CreateMockTestPayload) {
    return this.createMockTestUseCase.execute(userId, payload)
  }

  generateTest(userId: string, payload: GenerateMockTestPayload) {
    return this.generateMockTestUseCase.execute(userId, payload)
  }

  shareTest(userId: string, testId: string, origin: string) {
    return this.shareMockTestUseCase.execute({ userId, testId, origin })
  }

  importSharedTest(userId: string, shareToken: string) {
    return this.importSharedMockTestUseCase.execute({ userId, shareToken })
  }

  getTest(testId: string, userId: string) {
    return this.getMockTestDetailsUseCase.execute(testId, userId)
  }

  startAttempt(testId: string, userId: string) {
    return this.startTestAttemptUseCase.execute(testId, userId)
  }

  getAttemptQuestions(attemptId: string, userId: string) {
    return this.getAttemptQuestionsUseCase.execute(attemptId, userId)
  }

  submitAnswer(attemptId: string, userId: string, payload: SubmitAnswerPayload) {
    return this.submitAnswerUseCase.execute(attemptId, userId, payload)
  }

  flagQuestion(attemptId: string, userId: string, questionId: string) {
    return this.flagQuestionUseCase.execute(attemptId, userId, questionId)
  }

  finishAttempt(attemptId: string, userId: string) {
    return this.finishTestAttemptUseCase.execute(attemptId, userId)
  }

  getAttemptResult(attemptId: string, userId: string) {
    return this.getAttemptResultUseCase.execute(attemptId, userId)
  }

  getAttemptAnalysis(attemptId: string, userId: string) {
    return this.getAttemptAnalysisUseCase.execute(attemptId, userId)
  }

  retakeTest(attemptId: string, userId: string) {
    return this.retakeTestUseCase.execute(attemptId, userId)
  }

  getHistory(userId: string) {
    return this.getHistoryUseCase.execute(userId)
  }

  getAnalytics(userId: string) {
    return this.getAnalyticsUseCase.execute(userId)
  }

  getAIInsights(userId: string) {
    return this.getAIInsightsUseCase.execute(userId)
  }

  getTopicBreakdown(userId: string) {
    return this.getTopicBreakdownUseCase.execute(userId)
  }

  runCode(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: RunMockTestCodePayload,
  ) {
    return this.runMockTestCodeUseCase.execute(
      attemptId,
      userId,
      questionId,
      payload,
    )
  }

  submitCode(
    attemptId: string,
    userId: string,
    questionId: string,
    payload: SubmitMockTestCodePayload,
  ) {
    return this.submitMockTestCodeUseCase.execute(
      attemptId,
      userId,
      questionId,
      payload,
    )
  }
}

const mapper = new MockTestsMapper()
const scoringService = new MockTestScoringService()

export const mockTestsService = new MockTestsService(
  mongoMockTestsRepository,
  geminiGroqMockTestAIService,
  mongoQuestionBankService,
  pistonMockTestCodeRunnerService,
  mapper,
  scoringService,
  cryptoShareTokenGeneratorService,
)
