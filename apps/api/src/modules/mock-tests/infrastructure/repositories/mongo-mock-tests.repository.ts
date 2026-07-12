import type { CreateMockTestAIEvaluationInput } from '../../domain/repositories/mock-test-ai-evaluation.repository.interface';
import type {
  FindMockTestAnswerByQuestionInput,
  MockTestQuestionFlagInput,
  SaveMockTestAnswerInput,
  UpdateMockTestAnswerInput,
} from '../../domain/repositories/mock-test-answer.repository.interface';
import type {
  AbandonActiveMockTestAttemptsInput,
  CreateMockTestAttemptInput,
  FindActiveMockTestAttemptInput,
  FindLatestMockTestAttemptsInput,
  FindMockTestAttemptsByUserInput,
  UpdateMockTestAttemptInput,
} from '../../domain/repositories/mock-test-attempt.repository.interface';
import type {
  CreateMockTestCreationSessionInput,
  UpdateMockTestCreationSessionInput,
} from '../../domain/repositories/mock-test-creation-session.repository.interface';
import type { CreateMockTestQuestionInput } from '../../domain/repositories/mock-test-question.repository.interface';
import type { CreateMockTestReportInput } from '../../domain/repositories/mock-test-report.repository.interface';
import type {
  EnableMockTestSharingInput,
  FindImportedSharedTestInput,
} from '../../domain/repositories/mock-test-sharing.repository.interface';
import type {
  CreateMockTestInput,
  FindMockTestsByOwnerInput,
  FindPublicMockTestsInput,
  UpdateMockTestInput,
} from '../../domain/repositories/mock-test.repository.interface';
import type { IMockTestsRepository } from '../../domain/repositories/mock-tests.repository.interface';
import { MongoMockTestsAIEvaluationRepository } from './internal/mongo-mock-tests-ai-evaluation.repository';
import { MongoMockTestsAnalyticsRepository } from './internal/mongo-mock-tests-analytics.repository';
import { MongoMockTestsAnswerRepository } from './internal/mongo-mock-tests-answer.repository';
import { MongoMockTestsAttemptRepository } from './internal/mongo-mock-tests-attempt.repository';
import { MongoMockTestsCreationSessionRepository } from './internal/mongo-mock-tests-creation-session.repository';
import { MongoMockTestsQuestionRepository } from './internal/mongo-mock-tests-question.repository';
import { MongoMockTestsReportRepository } from './internal/mongo-mock-tests-report.repository';
import { MongoMockTestsSharingRepository } from './internal/mongo-mock-tests-sharing.repository';
import { MongoMockTestsTestRepository } from './internal/mongo-mock-tests-test.repository';
import { MongoMockTestsMapper } from './shared/mongo-mock-tests.mapper';

type MongoMockTestsRepositoryDependencies = {
  testRepository: MongoMockTestsTestRepository;
  sharingRepository: MongoMockTestsSharingRepository;
  questionRepository: MongoMockTestsQuestionRepository;
  attemptRepository: MongoMockTestsAttemptRepository;
  answerRepository: MongoMockTestsAnswerRepository;
  aiEvaluationRepository: MongoMockTestsAIEvaluationRepository;
  reportRepository: MongoMockTestsReportRepository;
  analyticsRepository: MongoMockTestsAnalyticsRepository;
  creationSessionRepository: MongoMockTestsCreationSessionRepository;
};

export class MongoMockTestsRepository implements IMockTestsRepository {
  private readonly _testRepository: MongoMockTestsTestRepository;
  private readonly _sharingRepository: MongoMockTestsSharingRepository;
  private readonly _questionRepository: MongoMockTestsQuestionRepository;
  private readonly _attemptRepository: MongoMockTestsAttemptRepository;
  private readonly _answerRepository: MongoMockTestsAnswerRepository;
  private readonly _aiEvaluationRepository: MongoMockTestsAIEvaluationRepository;
  private readonly _reportRepository: MongoMockTestsReportRepository;
  private readonly _analyticsRepository: MongoMockTestsAnalyticsRepository;
  private readonly _creationSessionRepository: MongoMockTestsCreationSessionRepository;

  constructor(
    mapper: MongoMockTestsMapper = new MongoMockTestsMapper(),
    dependencies: Partial<MongoMockTestsRepositoryDependencies> = {},
  ) {
    this._testRepository =
      dependencies.testRepository ??
      new MongoMockTestsTestRepository(mapper);

    this._sharingRepository =
      dependencies.sharingRepository ??
      new MongoMockTestsSharingRepository(mapper);

    this._questionRepository =
      dependencies.questionRepository ??
      new MongoMockTestsQuestionRepository(mapper);

    this._attemptRepository =
      dependencies.attemptRepository ??
      new MongoMockTestsAttemptRepository(mapper);

    this._answerRepository =
      dependencies.answerRepository ??
      new MongoMockTestsAnswerRepository(mapper);

    this._aiEvaluationRepository =
      dependencies.aiEvaluationRepository ??
      new MongoMockTestsAIEvaluationRepository(mapper);

    this._reportRepository =
      dependencies.reportRepository ??
      new MongoMockTestsReportRepository(mapper);

    this._analyticsRepository =
      dependencies.analyticsRepository ??
      new MongoMockTestsAnalyticsRepository(mapper);

    this._creationSessionRepository =
      dependencies.creationSessionRepository ??
      new MongoMockTestsCreationSessionRepository(mapper);
  }

  async findTestById(testId: string) {
    return this._testRepository.findTestById(testId);
  }

  async findTestsByOwner(input: FindMockTestsByOwnerInput) {
    return this._testRepository.findTestsByOwner(input);
  }

  async findPublicTests(input: FindPublicMockTestsInput) {
    return this._testRepository.findPublicTests(input);
  }

  async findSharedTestByToken(shareToken: string) {
    return this._sharingRepository.findSharedTestByToken(shareToken);
  }

  async findImportedSharedTest(input: FindImportedSharedTestInput) {
    return this._sharingRepository.findImportedSharedTest(input);
  }

  async enableTestSharing(input: EnableMockTestSharingInput) {
    return this._sharingRepository.enableTestSharing(input);
  }

  async incrementCloneCount(testId: string) {
    return this._sharingRepository.incrementCloneCount(testId);
  }

  async createTest(data: CreateMockTestInput) {
    return this._testRepository.createTest(data);
  }

  async updateTest(testId: string, data: UpdateMockTestInput) {
    return this._testRepository.updateTest(testId, data);
  }

  async deleteTest(testId: string) {
    return this._testRepository.deleteTest(testId);
  }

  async findQuestionsByTest(testId: string) {
    return this._questionRepository.findQuestionsByTest(testId);
  }

  async findQuestionById(questionId: string) {
    return this._questionRepository.findQuestionById(questionId);
  }

  async createQuestions(questions: CreateMockTestQuestionInput[]) {
    return this._questionRepository.createQuestions(questions);
  }

  async findAttemptById(attemptId: string) {
    return this._attemptRepository.findAttemptById(attemptId);
  }

  async findAttemptsByUser(input: FindMockTestAttemptsByUserInput) {
    return this._attemptRepository.findAttemptsByUser(input);
  }

  async findLatestAttemptsForTests(input: FindLatestMockTestAttemptsInput) {
    return this._attemptRepository.findLatestAttemptsForTests(input);
  }

  async findActiveAttempt(input: FindActiveMockTestAttemptInput) {
    return this._attemptRepository.findActiveAttempt(input);
  }

  async createAttempt(data: CreateMockTestAttemptInput) {
    return this._attemptRepository.createAttempt(data);
  }

  async updateAttempt(
    attemptId: string,
    data: UpdateMockTestAttemptInput,
  ) {
    return this._attemptRepository.updateAttempt(attemptId, data);
  }

  async incrementAnsweredCount(attemptId: string) {
    return this._attemptRepository.incrementAnsweredCount(attemptId);
  }

  async abandonActiveAttempts(input: AbandonActiveMockTestAttemptsInput) {
    return this._attemptRepository.abandonActiveAttempts(input);
  }

  async findAnswersByAttempt(attemptId: string) {
    return this._answerRepository.findAnswersByAttempt(attemptId);
  }

  async findAnswerByQuestion(input: FindMockTestAnswerByQuestionInput) {
    return this._answerRepository.findAnswerByQuestion(input);
  }

  async saveAnswer(data: SaveMockTestAnswerInput) {
    return this._answerRepository.saveAnswer(data);
  }

  async updateAnswer(
    answerId: string,
    data: UpdateMockTestAnswerInput,
  ) {
    return this._answerRepository.updateAnswer(answerId, data);
  }

  async flagQuestion(input: MockTestQuestionFlagInput) {
    return this._attemptRepository.flagQuestion(input);
  }

  async unflagQuestion(input: MockTestQuestionFlagInput) {
    return this._attemptRepository.unflagQuestion(input);
  }

  async createAIEvaluation(data: CreateMockTestAIEvaluationInput) {
    return this._aiEvaluationRepository.createAIEvaluation(data);
  }

  async findAIEvaluationsByAttempt(attemptId: string) {
    return this._aiEvaluationRepository.findAIEvaluationsByAttempt(attemptId);
  }

  async findReportByAttempt(attemptId: string) {
    return this._reportRepository.findReportByAttempt(attemptId);
  }

  async createReport(data: CreateMockTestReportInput) {
    return this._reportRepository.createReport(data);
  }

  async getAttemptHistory(userId: string) {
    return this._analyticsRepository.getAttemptHistory(userId);
  }

  async getUserSummary(userId: string) {
    return this._analyticsRepository.getUserSummary(userId);
  }

  async getPerformanceTrends(userId: string) {
    return this._analyticsRepository.getPerformanceTrends(userId);
  }

  async getTopicBreakdown(userId: string) {
    return this._analyticsRepository.getTopicBreakdown(userId);
  }

  async updateAnalyticsSnapshot(testId: string) {
    return this._analyticsRepository.updateAnalyticsSnapshot(testId);
  }

  async findCreationSession(sessionId: string) {
    return this._creationSessionRepository.findCreationSession(sessionId);
  }

  async findActiveCreationSession(userId: string) {
    return this._creationSessionRepository.findActiveCreationSession(userId);
  }

  async createCreationSession(data: CreateMockTestCreationSessionInput) {
    return this._creationSessionRepository.createCreationSession(data);
  }

  async updateCreationSession(
    sessionId: string,
    data: UpdateMockTestCreationSessionInput,
  ) {
    return this._creationSessionRepository.updateCreationSession(
      sessionId,
      data,
    );
  }

  async cancelCreationSession(sessionId: string) {
    return this._creationSessionRepository.cancelCreationSession(sessionId);
  }
}

export const mongoMockTestsRepository = new MongoMockTestsRepository();
