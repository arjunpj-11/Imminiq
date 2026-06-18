export { mockTestsService } from './mock-tests.service'
export type { MockTestsService } from './mock-tests.service'

export type {
  AttemptAnalysis,
  CreateMockTestPayload,
  GenerateMockTestPayload,
  MockTest,
  MockTestAIEvaluation,
  MockTestAnswer,
  MockTestAttempt,
  MockTestCodingDetails,
  MockTestCodingLanguage,
  MockTestCreationSession,
  MockTestQuestion,
  MockTestReport,
  MockTestSummary,
  PublicMockTestQuestion,
  RunMockTestCodePayload,
  SubmitAnswerPayload,
  SubmitMockTestCodePayload,
  TestAnalytics,
  TestAttemptResult,
} from './application/dtos/mock-tests.dto'

export type {
  DifficultyLevel,
  QuestionType,
  TestVisibility,
} from './domain/types/mock-tests.types'
