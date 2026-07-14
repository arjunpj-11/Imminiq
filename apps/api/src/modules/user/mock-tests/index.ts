export type {
  IAttemptAnalysisDTO,
  ICreateMockTestPayloadDTO,
  IGenerateMockTestPayloadDTO,
  IMockTestDTO,
  IMockTestAIEvaluationDTO,
  IMockTestAnswerDTO,
  IMockTestAttemptDTO,
  MockTestCodingDetails,
  MockTestCodingLanguage,
  IMockTestCreationSessionDTO,
  IMockTestQuestionDTO,
  IMockTestReportDTO,
  IMockTestSummaryDTO,
  PublicMockTestQuestionDTO,
  IRunMockTestCodePayloadDTO,
  ISubmitAnswerPayloadDTO,
  SubmitMockTestCodePayloadDTO,
  ITestAnalyticsDTO,
  ITestAttemptResultDTO,
} from './application/mock-tests.dto';

export type { DifficultyLevel, QuestionType, TestVisibility } from './domain/mock-tests.types';

export type { IGenerateMockTestUseCase } from './application/use-cases/generate-mock-test.usecase';
export type { IMockTestCompletionObserver } from './domain/services/mock-test-completion-observer.interface';

export { createMockTestsComposition } from './mock-tests.factory';
export { createMockTestsRoutes } from './presentation/mock-tests.routes';
