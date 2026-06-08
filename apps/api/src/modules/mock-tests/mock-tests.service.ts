import { mongoMockTestsRepository } from './infrastructure/repositories/mongo-mock-tests.repository'
import { MockTestAIService } from './infrastructure/mock-test-ai.service'
import { CreateMockTestUseCase } from './application/use-cases/create-mock-test.usecase'
import { GenerateMockTestUseCase } from './application/use-cases/generate-mock-test.usecase'
import { ListMockTestsUseCase } from './application/use-cases/list-mock-tests.usecase'
import { GetMockTestDetailsUseCase } from './application/use-cases/get-mock-test-details.usecase'
import { StartTestAttemptUseCase } from './application/use-cases/start-test-attempt.usecase'
import { SubmitAnswerUseCase } from './application/use-cases/submit-answer.usecase'
import { FlagQuestionUseCase } from './application/use-cases/flag-question.usecase'
import { FinishTestAttemptUseCase } from './application/use-cases/finish-test-attempt.usecase'
import { GetAttemptResultUseCase } from './application/use-cases/get-attempt-result.usecase'
import { GetAttemptAnalysisUseCase } from './application/use-cases/get-attempt-analysis.usecase'
import { RetakeTestUseCase } from './application/use-cases/retake-test.usecase'
import { GetAnalyticsUseCase } from './application/use-cases/get-analytics.usecase'
import { CreateMockTestPayload, GenerateMockTestPayload, SubmitAnswerPayload, DifficultyLevel } from './domain/types/mock-tests.types'
import { sanitizeQuestionForAttempt } from './application/services/test-scorer.service'

const repo = mongoMockTestsRepository
const aiService = new MockTestAIService()

const listMockTestsUseCase = new ListMockTestsUseCase(repo)
const getMockTestDetailsUseCase = new GetMockTestDetailsUseCase(repo)
const createMockTestUseCase = new CreateMockTestUseCase(repo)
const generateMockTestUseCase = new GenerateMockTestUseCase(repo, aiService)
const startTestAttemptUseCase = new StartTestAttemptUseCase(repo)
const submitAnswerUseCase = new SubmitAnswerUseCase(repo, aiService)
const flagQuestionUseCase = new FlagQuestionUseCase(repo)
const finishTestAttemptUseCase = new FinishTestAttemptUseCase(repo)
const getAttemptResultUseCase = new GetAttemptResultUseCase(repo)
const getAttemptAnalysisUseCase = new GetAttemptAnalysisUseCase(repo)
const retakeTestUseCase = new RetakeTestUseCase(repo)
const getAnalyticsUseCase = new GetAnalyticsUseCase(repo, aiService)

export const mockTestsService = {
  listTests: (userId: string) => listMockTestsUseCase.execute(userId),
  listPublicTests: (filters: { difficulty?: DifficultyLevel; tags?: string[]; page?: number; limit?: number }) => repo.findPublicTests(filters),
  createTest: (userId: string, payload: CreateMockTestPayload) => createMockTestUseCase.execute(userId, payload),
  generateTest: (userId: string, payload: GenerateMockTestPayload) => generateMockTestUseCase.execute(userId, payload),
  getTest: (testId: string, userId: string) => getMockTestDetailsUseCase.execute(testId, userId),
  startAttempt: (testId: string, userId: string) => startTestAttemptUseCase.execute(testId, userId),
  getAttemptQuestions: async (attemptId: string, userId: string) => {
    const attempt = await repo.findAttemptById(attemptId)
    if (!attempt || attempt.userId !== userId) return []
    const questions = await repo.findQuestionsByTest(attempt.testId)
    return questions.map(sanitizeQuestionForAttempt)
  },
  submitAnswer: (attemptId: string, userId: string, payload: SubmitAnswerPayload) => submitAnswerUseCase.execute(attemptId, userId, payload),
  flagQuestion: (attemptId: string, userId: string, questionId: string) => flagQuestionUseCase.execute(attemptId, userId, questionId),
  finishAttempt: (attemptId: string, userId: string) => finishTestAttemptUseCase.execute(attemptId, userId),
  getAttemptResult: (attemptId: string, userId: string) => getAttemptResultUseCase.execute(attemptId, userId),
  getAttemptAnalysis: (attemptId: string, userId: string) => getAttemptAnalysisUseCase.execute(attemptId, userId),
  retakeTest: (attemptId: string, userId: string) => retakeTestUseCase.execute(attemptId, userId),
  getHistory: (userId: string) => repo.getAttemptHistory(userId),
  getAnalytics: (userId: string) => getAnalyticsUseCase.execute(userId),
  getAIInsights: async (userId: string) => ({ insight: (await getAnalyticsUseCase.execute(userId)).aiInsights }),
  getTopicBreakdown: (userId: string) => repo.getTopicBreakdown(userId),
}
