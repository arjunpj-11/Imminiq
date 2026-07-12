import type { MockTestAIEvaluationEntity } from '../../domain/entities/mock-test-ai-evaluation.entity'
import type { MockTestAnswerEntity } from '../../domain/entities/mock-test-answer.entity'
import { MockTestAttemptEntity } from '../../domain/entities/mock-test-attempt.entity'
import type { MockTestCreationSessionEntity } from '../../domain/entities/mock-test-creation-session.entity'
import type { MockTestQuestionEntity } from '../../domain/entities/mock-test-question.entity'
import type { MockTestReportEntity } from '../../domain/entities/mock-test-report.entity'
import { MockTestEntity } from '../../domain/entities/mock-test.entity'
import type {
  IFinishMockTestAttemptDTO,
  IImportSharedMockTestDTO,
  IMockTestDTO,
  IMockTestAIEvaluationDTO,
  IMockTestAnswerDTO,
  IMockTestAttemptDTO,
  IMockTestCreationSessionDTO,
  IMockTestQuestionDTO,
  IMockTestReportDTO,
  IMockTestAttemptHistoryDTO,
  IMockTestAttemptSessionDTO,
  IMockTestDetailsDTO,
  IMockTestListDTO,
  PublicMockTestDTO,
  IPublicMockTestListDTO,
  PublicMockTestQuestionDTO,
  ITestAnalyticsDTO,
  ITestAttemptResultDTO,
} from '../dtos/mock-tests.dto'
import type { MockTestListResult } from '../../domain/repositories/mock-test.repository.interface'
import type {
  MockTestAttemptHistoryItem,
  MockTestPerformanceTrend,
  MockTestTopicBreakdown,
} from '../../domain/value-objects/mock-test-analytics.vo'
import type { IScoreResult } from '../services/test-scorer.service'

export interface IMockTestsMapper {
  toMockTest(test: MockTestEntity): IMockTestDTO
  toPublicMockTest(test: MockTestEntity): PublicMockTestDTO
  toQuestion(question: MockTestQuestionEntity): IMockTestQuestionDTO
  toAttempt(attempt: MockTestAttemptEntity): IMockTestAttemptDTO
  toAnswer(answer: MockTestAnswerEntity): IMockTestAnswerDTO
  toAIEvaluation(evaluation: MockTestAIEvaluationEntity): IMockTestAIEvaluationDTO
  toReport(report: MockTestReportEntity): IMockTestReportDTO
  sanitizeQuestionForAttempt(question: MockTestQuestionEntity): PublicMockTestQuestionDTO
  toListItem(test: MockTestEntity, latestAttempt?: MockTestAttemptEntity | null): IMockTestDTO & { latestAttempt: IMockTestAttemptDTO | null }
  toAttemptResult(input: {
    attempt: MockTestAttemptEntity
    report: MockTestReportEntity | null
    answers: (MockTestAnswerEntity & {
      question?: MockTestQuestionEntity
      aiEvaluation?: MockTestAIEvaluationEntity
    })[]
  }): ITestAttemptResultDTO
  toCreationSessionDto(session: MockTestCreationSessionEntity): IMockTestCreationSessionDTO
  toListDto(result: MockTestListResult): IMockTestListDTO
  toPublicListDto(result: MockTestListResult): IPublicMockTestListDTO
  toDetailsDto(input: {
    test: MockTestEntity
    questions: MockTestQuestionEntity[]
    latestAttempt: MockTestAttemptEntity | null
    includeAnswers: boolean
  }): IMockTestDetailsDTO
  toAttemptSessionDto(
    attempt: MockTestAttemptEntity,
    questions: MockTestQuestionEntity[],
  ): IMockTestAttemptSessionDTO
  toFinishAttemptDto(input: {
    attempt: MockTestAttemptEntity
    report: MockTestReportEntity
    scoreResult: IScoreResult
  }): IFinishMockTestAttemptDTO
  toImportSharedDto(input: {
    test: MockTestEntity
    imported: boolean
    alreadyImported: boolean
  }): IImportSharedMockTestDTO
  toAttemptHistoryDto(item: MockTestAttemptHistoryItem): IMockTestAttemptHistoryDTO
  toPerformanceTrendDto(
    trend: MockTestPerformanceTrend,
  ): ITestAnalyticsDTO['trends'][number]
  toTopicBreakdownDto(
    item: MockTestTopicBreakdown,
  ): ITestAnalyticsDTO['topicBreakdown'][number]
}

export class MockTestsMapper implements IMockTestsMapper {
  toMockTest(test: MockTestEntity): IMockTestDTO {
    return {
      _id: test._id,
      ownerId: test.ownerId,
      trackerId: test.trackerId,
      sourceTestId: test.sourceTestId,
      title: test.title,
      description: test.description,
      difficulty: test.difficulty,
      visibility: test.visibility,
      questionCount: test.questionCount,
      timeLimitMinutes: test.timeLimitMinutes,
      passingScore: test.passingScore,
      isAIGenerated: test.isAIGenerated,
      tags: [...test.tags],
      shareToken: test.shareToken,
      isShareEnabled: test.isShareEnabled,
      cloneCount: test.cloneCount,
      averageScore: test.averageScore,
      attemptCount: test.attemptCount,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    }
  }

  toPublicMockTest(test: MockTestEntity): PublicMockTestDTO {
    const { shareToken: _shareToken, ...safeTest } = this.toMockTest(test)
    return safeTest
  }

  toQuestion(question: MockTestQuestionEntity): IMockTestQuestionDTO {
    return {
      _id: question._id,
      testId: question.testId,
      type: question.type,
      question: question.question,
      options: question.options ? [...question.options] : undefined,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      order: question.order,
      points: question.points,
      coding: question.coding,
    }
  }

  toAttempt(attempt: MockTestAttemptEntity): IMockTestAttemptDTO {
    return {
      _id: attempt._id,
      testId: attempt.testId,
      userId: attempt.userId,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      timeTakenSeconds: attempt.timeTakenSeconds,
      score: attempt.score,
      scorePercentage: attempt.scorePercentage,
      passed: attempt.passed,
      flaggedQuestions: [...attempt.flaggedQuestions],
      totalQuestions: attempt.totalQuestions,
      answeredQuestions: attempt.answeredQuestions,
      createdAt: attempt.createdAt,
    }
  }

  toAnswer(answer: MockTestAnswerEntity): IMockTestAnswerDTO {
    return {
      _id: answer._id,
      attemptId: answer.attemptId,
      questionId: answer.questionId,
      answer: answer.answer,
      isCorrect: answer.isCorrect,
      pointsEarned: answer.pointsEarned,
      aiEvaluationId: answer.aiEvaluationId,
      submittedAt: answer.submittedAt,
    }
  }

  toAIEvaluation(evaluation: MockTestAIEvaluationEntity): IMockTestAIEvaluationDTO {
    return {
      _id: evaluation._id,
      attemptId: evaluation.attemptId,
      questionId: evaluation.questionId,
      answerId: evaluation.answerId,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      feedback: evaluation.feedback,
      status: evaluation.status,
      createdAt: evaluation.createdAt,
    }
  }

  toReport(report: MockTestReportEntity): IMockTestReportDTO {
    return {
      _id: report._id,
      attemptId: report.attemptId,
      userId: report.userId,
      testId: report.testId,
      score: report.score,
      scorePercentage: report.scorePercentage,
      passed: report.passed,
      timeTakenSeconds: report.timeTakenSeconds,
      totalQuestions: report.totalQuestions,
      correctAnswers: report.correctAnswers,
      incorrectAnswers: report.incorrectAnswers,
      skippedAnswers: report.skippedAnswers,
      strongTopics: [...report.strongTopics],
      weakTopics: [...report.weakTopics],
      recommendations: [...report.recommendations],
      createdAt: report.createdAt,
    }
  }

  sanitizeQuestionForAttempt(question: MockTestQuestionEntity): PublicMockTestQuestionDTO {
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
  ): IMockTestDTO & { latestAttempt: IMockTestAttemptDTO | null } {
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
  }): ITestAttemptResultDTO {
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

  toCreationSessionDto(session: MockTestCreationSessionEntity): IMockTestCreationSessionDTO {
    return {
      _id: session._id,
      userId: session.userId,
      status: session.status,
      step: session.step,
      draftData: { ...session.draftData },
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }
  }

  toListDto(result: MockTestListResult): IMockTestListDTO {
    return {
      tests: result.tests.map((test) => this.toMockTest(test)),
      total: result.total,
    }
  }

  toPublicListDto(result: MockTestListResult): IPublicMockTestListDTO {
    return {
      tests: result.tests.map((test) => this.toPublicMockTest(test)),
      total: result.total,
    }
  }

  toDetailsDto(input: {
    test: MockTestEntity
    questions: MockTestQuestionEntity[]
    latestAttempt: MockTestAttemptEntity | null
    includeAnswers: boolean
  }): IMockTestDetailsDTO {
    return {
      test: input.includeAnswers
        ? this.toMockTest(input.test)
        : this.toPublicMockTest(input.test),
      questions: input.includeAnswers
        ? input.questions.map((question) => this.toQuestion(question))
        : input.questions.map((question) => this.sanitizeQuestionForAttempt(question)),
      latestAttempt: input.latestAttempt
        ? this.toAttempt(input.latestAttempt)
        : null,
    }
  }

  toAttemptSessionDto(
    attempt: MockTestAttemptEntity,
    questions: MockTestQuestionEntity[],
  ): IMockTestAttemptSessionDTO {
    return {
      attempt: this.toAttempt(attempt),
      questions: questions.map((question) =>
        this.sanitizeQuestionForAttempt(question)),
    }
  }

  toFinishAttemptDto(input: {
    attempt: MockTestAttemptEntity
    report: MockTestReportEntity
    scoreResult: IScoreResult
  }): IFinishMockTestAttemptDTO {
    return {
      attempt: this.toAttempt(input.attempt),
      report: this.toReport(input.report),
      scoreResult: { ...input.scoreResult },
    }
  }

  toImportSharedDto(input: {
    test: MockTestEntity
    imported: boolean
    alreadyImported: boolean
  }): IImportSharedMockTestDTO {
    return {
      test: this.toMockTest(input.test),
      imported: input.imported,
      alreadyImported: input.alreadyImported,
    }
  }

  toAttemptHistoryDto(
    item: MockTestAttemptHistoryItem,
  ): IMockTestAttemptHistoryDTO {
    return {
      ...this.toAttempt(new MockTestAttemptEntity(item)),
      test: item.test
        ? this.toMockTest(new MockTestEntity(item.test))
        : null,
    }
  }

  toPerformanceTrendDto(
    trend: MockTestPerformanceTrend,
  ): ITestAnalyticsDTO['trends'][number] {
    return {
      date: trend.date,
      averageScore: trend.averageScore,
      attempts: trend.attempts,
    }
  }

  toTopicBreakdownDto(
    item: MockTestTopicBreakdown,
  ): ITestAnalyticsDTO['topicBreakdown'][number] {
    return {
      topic: item.topic,
      averageScore: item.averageScore,
      totalAttempts: item.totalAttempts,
    }
  }
}
