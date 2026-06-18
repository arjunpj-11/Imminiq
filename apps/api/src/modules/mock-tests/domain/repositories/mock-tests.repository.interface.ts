import type { MockTestAIEvaluationRepositoryContract } from './mock-test-ai-evaluation.repository.interface'
import type { MockTestAnalyticsRepositoryContract } from './mock-test-analytics.repository.interface'
import type { MockTestAnswerRepositoryContract } from './mock-test-answer.repository.interface'
import type { MockTestAttemptRepositoryContract } from './mock-test-attempt.repository.interface'
import type { MockTestCreationSessionRepositoryContract } from './mock-test-creation-session.repository.interface'
import type { MockTestQuestionRepositoryContract } from './mock-test-question.repository.interface'
import type { MockTestReportRepositoryContract } from './mock-test-report.repository.interface'
import type { MockTestSharingRepositoryContract } from './mock-test-sharing.repository.interface'
import type { MockTestRepositoryContract } from './mock-test.repository.interface'

export interface MockTestsRepositoryContract
  extends MockTestRepositoryContract,
  MockTestQuestionRepositoryContract,
  MockTestAttemptRepositoryContract,
  MockTestAnswerRepositoryContract,
  MockTestAIEvaluationRepositoryContract,
  MockTestReportRepositoryContract,
  MockTestAnalyticsRepositoryContract,
  MockTestCreationSessionRepositoryContract,
  MockTestSharingRepositoryContract { }
