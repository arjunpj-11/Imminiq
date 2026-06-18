import type { MockTestAIEvaluationEntity } from '../../domain/entities/mock-test-ai-evaluation.entity'
import type { MockTestAnswerEntity } from '../../domain/entities/mock-test-answer.entity'
import type { MockTestAttemptEntity } from '../../domain/entities/mock-test-attempt.entity'
import type { MockTestCreationSessionEntity } from '../../domain/entities/mock-test-creation-session.entity'
import type { MockTestQuestionEntity } from '../../domain/entities/mock-test-question.entity'
import type { MockTestReportEntity } from '../../domain/entities/mock-test-report.entity'
import type { MockTestEntity } from '../../domain/entities/mock-test.entity'
import type {
  MockTest,
  MockTestAIEvaluation,
  MockTestAnswer,
  MockTestAttempt,
  MockTestCreationSession,
  MockTestQuestion,
  MockTestReport,
  PublicMockTestQuestion,
  TestAttemptResult,
} from '../dtos/mock-tests.dto'

export interface MockTestsMapperContract {
  toMockTest(test: MockTestEntity): MockTest
  toQuestion(question: MockTestQuestionEntity): MockTestQuestion
  toAttempt(attempt: MockTestAttemptEntity): MockTestAttempt
  toAnswer(answer: MockTestAnswerEntity): MockTestAnswer
  toAIEvaluation(evaluation: MockTestAIEvaluationEntity): MockTestAIEvaluation
  toReport(report: MockTestReportEntity): MockTestReport
  sanitizeQuestionForAttempt(question: MockTestQuestionEntity): PublicMockTestQuestion
  toListItem(test: MockTestEntity, latestAttempt?: MockTestAttemptEntity | null): MockTest & { latestAttempt: MockTestAttempt | null }
  toAttemptResult(input: {
    attempt: MockTestAttemptEntity
    report: MockTestReportEntity | null
    answers: (MockTestAnswerEntity & {
      question?: MockTestQuestionEntity
      aiEvaluation?: MockTestAIEvaluationEntity
    })[]
  }): TestAttemptResult
  toCreationSessionDto(session: MockTestCreationSessionEntity): MockTestCreationSession
}

export class MockTestsMapper implements MockTestsMapperContract {
  toMockTest(test: MockTestEntity): MockTest {
    return { ...test }
  }

  toQuestion(question: MockTestQuestionEntity): MockTestQuestion {
    return { ...question }
  }

  toAttempt(attempt: MockTestAttemptEntity): MockTestAttempt {
    return { ...attempt }
  }

  toAnswer(answer: MockTestAnswerEntity): MockTestAnswer {
    return { ...answer }
  }

  toAIEvaluation(evaluation: MockTestAIEvaluationEntity): MockTestAIEvaluation {
    return { ...evaluation }
  }

  toReport(report: MockTestReportEntity): MockTestReport {
    return { ...report }
  }

  sanitizeQuestionForAttempt(question: MockTestQuestionEntity): PublicMockTestQuestion {
    return {
      _id: question._id,
      testId: question.testId,
      type: question.type,
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
      order: question.order,
      points: question.points,
      coding: question.coding
        ? {
          ...question.coding,
          testCases: question.coding.testCases
            .filter((testCase) => !testCase.isHidden)
            .map((testCase) => ({ ...testCase, isHidden: false })),
        }
        : undefined,
    }
  }

  toListItem(
    test: MockTestEntity,
    latestAttempt?: MockTestAttemptEntity | null,
  ): MockTest & { latestAttempt: MockTestAttempt | null } {
    return {
      ...this.toMockTest(test),
      latestAttempt: latestAttempt ? this.toAttempt(latestAttempt) : null,
    }
  }

  toAttemptResult(input: {
    attempt: MockTestAttemptEntity
    report: MockTestReportEntity | null
    answers: (MockTestAnswerEntity & {
      question?: MockTestQuestionEntity
      aiEvaluation?: MockTestAIEvaluationEntity
    })[]
  }): TestAttemptResult {
    return {
      attempt: this.toAttempt(input.attempt),
      report: input.report ? this.toReport(input.report) : null,
      answers: input.answers.map((answer) => ({
        ...this.toAnswer(answer),
        question: answer.question ? this.toQuestion(answer.question) : undefined,
        aiEvaluation: answer.aiEvaluation
          ? this.toAIEvaluation(answer.aiEvaluation)
          : undefined,
      })),
    }
  }

  toCreationSessionDto(session: MockTestCreationSessionEntity): MockTestCreationSession {
    return { ...session }
  }
}
