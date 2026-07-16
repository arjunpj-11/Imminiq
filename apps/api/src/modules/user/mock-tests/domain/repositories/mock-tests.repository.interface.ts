import type { IMockTestAIEvaluationRepository } from './mock-test-ai-evaluation.repository.interface';
import type { IMockTestAnalyticsRepository } from './mock-test-analytics.repository.interface';
import type { IMockTestAnswerRepository } from './mock-test-answer.repository.interface';
import type { IMockTestAttemptRepository } from './mock-test-attempt.repository.interface';
import type { IMockTestCreationSessionRepository } from './mock-test-creation-session.repository.interface';
import type { IMockTestQuestionRepository } from './mock-test-question.repository.interface';
import type { IMockTestQuestionIssueRepository } from './mock-test-question-issue.repository.interface';
import type { IMockTestReportRepository } from './mock-test-report.repository.interface';
import type { IMockTestSharingRepository } from './mock-test-sharing.repository.interface';
import type { IMockTestRepository } from './mock-test.repository.interface';

export interface IMockTestsRepository
  extends
    IMockTestRepository,
    IMockTestQuestionRepository,
    IMockTestQuestionIssueRepository,
    IMockTestAttemptRepository,
    IMockTestAnswerRepository,
    IMockTestAIEvaluationRepository,
    IMockTestReportRepository,
    IMockTestAnalyticsRepository,
    IMockTestCreationSessionRepository,
    IMockTestSharingRepository {}
