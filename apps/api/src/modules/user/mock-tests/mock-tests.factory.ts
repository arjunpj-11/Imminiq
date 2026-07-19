import type { MockTestsUseCases } from './application/mock-tests-use-cases.contract';
import { MockTestsMapper, type IMockTestsMapper } from './application/mock-tests.mapper';
import { MockTestScorer, type IMockTestScorer } from './application/services/test-scorer.service';
import { CreateMockTestUseCase } from './application/use-cases/create-mock-test.usecase';
import { FinishTestAttemptUseCase } from './application/use-cases/finish-test-attempt.usecase';
import { FlagQuestionUseCase } from './application/use-cases/flag-question.usecase';
import { GenerateMockTestUseCase } from './application/use-cases/generate-mock-test.usecase';
import { GetAIInsightsUseCase } from './application/use-cases/get-ai-insights.usecase';
import { GetActiveMockTestGenerationUseCase } from './application/use-cases/get-active-mock-test-generation.usecase';
import { GetMockTestGenerationStatusUseCase } from './application/use-cases/get-mock-test-generation-status.usecase';
import { GetAnalyticsUseCase } from './application/use-cases/get-analytics.usecase';
import { GetAttemptAnalysisUseCase } from './application/use-cases/get-attempt-analysis.usecase';
import { GetAttemptQuestionsUseCase } from './application/use-cases/get-attempt-questions.usecase';
import { GetAttemptResultUseCase } from './application/use-cases/get-attempt-result.usecase';
import { GetHistoryUseCase } from './application/use-cases/get-history.usecase';
import { GetMockTestDetailsUseCase } from './application/use-cases/get-mock-test-details.usecase';
import { GetTopicBreakdownUseCase } from './application/use-cases/get-topic-breakdown.usecase';
import { ImportSharedMockTestUseCase } from './application/use-cases/import-shared-mock-test.usecase';
import { ListMockTestsUseCase } from './application/use-cases/list-mock-tests.usecase';
import { RetakeTestUseCase } from './application/use-cases/retake-test.usecase';
import { ReportQuestionIssueUseCase } from './application/use-cases/report-question-issue.usecase';
import { RunMockTestCodeUseCase } from './application/use-cases/run-mock-test-code.usecase';
import { ShareMockTestUseCase } from './application/use-cases/share-mock-test.usecase';
import { StartTestAttemptUseCase } from './application/use-cases/start-test-attempt.usecase';
import { StartMockTestGenerationUseCase } from './application/use-cases/start-mock-test-generation.usecase';
import { SubmitAnswerUseCase } from './application/use-cases/submit-answer.usecase';
import { SubmitMockTestCodeUseCase } from './application/use-cases/submit-mock-test-code.usecase';

import type { IMockTestAIGateway } from './domain/services/mock-test-ai.interface';
import type { IMockTestCodeRunner } from './domain/services/mock-test-code-runner.interface';
import type { IMockTestQuestionBank } from './domain/services/mock-test-question-bank.interface';
import type { IShareTokenGenerator } from './domain/services/share-token-generator.interface';
import { systemClock } from '../../../infrastructure/time/system-clock';

import { ActivityMockTestGateway } from './infrastructure/gateways/activity-mock-test.gateway';
import { bullMqMockTestGenerationJobGateway } from './infrastructure/gateways/bullmq-mock-test-generation-job.gateway';
import type { IRecordUserActivityUseCase } from '../activity';
import { mongoMockTestsRepository } from './infrastructure/repositories/mongo-mock-tests.repository';
import { cryptoShareTokenGenerator } from './infrastructure/services/crypto-share-token-generator.service';
import { geminiGroqMockTestAIGateway } from './infrastructure/services/gemini-groq-mock-test-ai.service';
import { mongoQuestionBank } from './infrastructure/services/mongo-question-bank.service';
import { pistonMockTestCodeRunner } from './infrastructure/services/piston-mock-test-code-runner.service';
import type { IMockTestCompletionObserver } from './domain/services/mock-test-completion-observer.interface';
import { mongoPlatformPolicyReader } from '../../../infrastructure/mongo-platform-policy.reader';

export type MockTestsServiceHelpers = {
  mockTestsMapper: IMockTestsMapper;

  mockTestScorer: IMockTestScorer;

  mockTestAIGateway: IMockTestAIGateway;

  mockTestQuestionBank: IMockTestQuestionBank;

  mockTestCodeRunner: IMockTestCodeRunner;

  shareTokenGenerator: IShareTokenGenerator;
};

export type MockTestsComposition = {
  useCases: MockTestsUseCases;
  helpers: MockTestsServiceHelpers;
};

export const createMockTestsComposition = (
  activityRecorder: IRecordUserActivityUseCase,
  completionObserver?: IMockTestCompletionObserver
): MockTestsComposition => {
  const mockTestsRepository = mongoMockTestsRepository;

  const mockTestActivityRecorder = new ActivityMockTestGateway(activityRecorder);

  const mockTestAIGateway = geminiGroqMockTestAIGateway;

  const mockTestQuestionBank = mongoQuestionBank;

  const mockTestCodeRunner = pistonMockTestCodeRunner;

  const mockTestsMapper = new MockTestsMapper();

  const mockTestScorer = new MockTestScorer();

  const shareTokenGenerator = cryptoShareTokenGenerator;

  return {
    useCases: {
      listMockTests: new ListMockTestsUseCase(mockTestsRepository, mockTestsMapper),

      getMockTestDetails: new GetMockTestDetailsUseCase(mockTestsRepository, mockTestsMapper),

      createMockTest: new CreateMockTestUseCase(
        mockTestsRepository,
        mockTestsMapper,
        mongoPlatformPolicyReader
      ),

      generateMockTest: new GenerateMockTestUseCase(
        mockTestsRepository,
        mockTestAIGateway,
        mockTestQuestionBank,
        mockTestActivityRecorder,
        mockTestsMapper
      ),

      startMockTestGeneration: new StartMockTestGenerationUseCase(
        bullMqMockTestGenerationJobGateway
      ),

      getActiveMockTestGeneration: new GetActiveMockTestGenerationUseCase(
        bullMqMockTestGenerationJobGateway
      ),

      getMockTestGenerationStatus: new GetMockTestGenerationStatusUseCase(
        bullMqMockTestGenerationJobGateway
      ),

      startTestAttempt: new StartTestAttemptUseCase(mockTestsRepository, mockTestsMapper),

      getAttemptQuestions: new GetAttemptQuestionsUseCase(mockTestsRepository, mockTestsMapper),

      submitAnswer: new SubmitAnswerUseCase(
        mockTestsRepository,
        mockTestAIGateway,
        mockTestScorer,
        mockTestsMapper
      ),

      flagQuestion: new FlagQuestionUseCase(mockTestsRepository),

      reportQuestionIssue: new ReportQuestionIssueUseCase(mockTestsRepository),

      finishTestAttempt: new FinishTestAttemptUseCase(
        mockTestsRepository,
        mockTestScorer,
        mockTestActivityRecorder,
        mockTestsMapper,
        systemClock,
        mongoPlatformPolicyReader,
        completionObserver
      ),

      getAttemptResult: new GetAttemptResultUseCase(mockTestsRepository, mockTestsMapper),

      getAttemptAnalysis: new GetAttemptAnalysisUseCase(mockTestsRepository),

      retakeTest: new RetakeTestUseCase(mockTestsRepository, mockTestsMapper),

      getAnalytics: new GetAnalyticsUseCase(
        mockTestsRepository,
        mockTestAIGateway,
        mockTestsMapper
      ),

      getAIInsights: new GetAIInsightsUseCase(mockTestsRepository, mockTestAIGateway),

      getHistory: new GetHistoryUseCase(mockTestsRepository, mockTestsMapper),

      getTopicBreakdown: new GetTopicBreakdownUseCase(mockTestsRepository, mockTestsMapper),

      shareMockTest: new ShareMockTestUseCase(mockTestsRepository, shareTokenGenerator),

      importSharedMockTest: new ImportSharedMockTestUseCase(mockTestsRepository, mockTestsMapper),

      runMockTestCode: new RunMockTestCodeUseCase(mockTestsRepository, mockTestCodeRunner),

      submitMockTestCode: new SubmitMockTestCodeUseCase(mockTestsRepository, mockTestCodeRunner),
    },

    helpers: {
      mockTestsMapper,
      mockTestScorer,
      mockTestAIGateway,
      mockTestQuestionBank,
      mockTestCodeRunner,
      shareTokenGenerator,
    },
  };
};
