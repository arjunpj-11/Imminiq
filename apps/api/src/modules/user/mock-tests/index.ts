export type {
  AttemptAnalysisDTO,
  CreateMockTestPayloadDTO,
  GenerateMockTestPayloadDTO,
  MockTestDTO,
  MockTestAIEvaluationDTO,
  MockTestAnswerDTO,
  MockTestAttemptDTO,
  MockTestCodingDetails,
  MockTestCodingLanguage,
  MockTestCreationSessionDTO,
  MockTestQuestionDTO,
  MockTestReportDTO,
  MockTestSummaryDTO,
  PublicMockTestQuestionDTO,
  RunMockTestCodePayloadDTO,
  SubmitAnswerPayloadDTO,
  SubmitMockTestCodePayloadDTO,
  TestAnalyticsDTO,
  TestAttemptResultDTO,
} from './application/mock-tests.dto';

export type { DifficultyLevel, QuestionType } from './domain/mock-tests.types';

export type { IGenerateMockTestUseCase } from './application/use-cases/generate-mock-test.usecase';
export type { IMockTestCompletionObserver } from './domain/services/mock-test-completion-observer.interface';

export { createMockTestsComposition } from './mock-tests.factory';
export { createMockTestsRoutes } from './presentation/mock-tests.routes';
