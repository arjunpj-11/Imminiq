import mongoose from 'mongoose';

import { MockTestAIEvaluationEntity } from '../../../domain/entities/mock-test-ai-evaluation.entity';
import { MockTestAnswerEntity } from '../../../domain/entities/mock-test-answer.entity';
import { MockTestAttemptEntity } from '../../../domain/entities/mock-test-attempt.entity';
import { MockTestCreationSessionEntity } from '../../../domain/entities/mock-test-creation-session.entity';
import { MockTestQuestionEntity } from '../../../domain/entities/mock-test-question.entity';
import { MockTestReportEntity } from '../../../domain/entities/mock-test-report.entity';
import { MockTestEntity } from '../../../domain/entities/mock-test.entity';
import type {
  RawMockTestAIEvaluationDoc,
  RawMockTestAnswerDoc,
  RawMockTestAttemptDoc,
  RawMockTestCreationSessionDoc,
  RawMockTestDoc,
  RawMockTestQuestionDoc,
  RawMockTestReportDoc,
  RawRecord,
} from './mongo-mock-tests.types';

export class MongoMockTestsMapper {
  isRecord(value: unknown): value is RawRecord {
    return typeof value === 'object' && value !== null;
  }

  toId(value: unknown): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (value instanceof mongoose.Types.ObjectId) {
      return value.toString();
    }

    if (this.isRecord(value)) {
      const nestedId = value['_id'];

      if (nestedId === value) {
        return String(value);
      }

      return this.toId(nestedId);
    }

    return String(value);
  }

  optionalId(value: unknown): string | undefined {
    const resolvedId = this.toId(value);

    return resolvedId || undefined;
  }

  numberOrZero(value: unknown): number {
    return typeof value === 'number' ? value : 0;
  }

  dateOrNow(value: Date | undefined): Date {
    return value || new Date();
  }

  toMockTestEntity(doc: RawMockTestDoc): MockTestEntity {
    return new MockTestEntity({
      _id: this.toId(doc._id),
      ownerId: this.toId(doc.ownerId),
      trackerId: this.optionalId(doc.trackerId),
      sourceTestId: this.optionalId(doc.sourceTestId),
      title: doc.title || '',
      description: doc.description || '',
      difficulty: doc.difficulty || 'easy',
      visibility: doc.visibility || 'private',
      questionCount: this.numberOrZero(doc.questionCount),
      timeLimitMinutes: this.numberOrZero(doc.timeLimitMinutes),
      passingScore: this.numberOrZero(doc.passingScore),
      isAIGenerated: Boolean(doc.isAIGenerated),
      tags: doc.tags || [],
      shareToken: doc.shareToken,
      isShareEnabled: Boolean(doc.isShareEnabled),
      cloneCount: doc.cloneCount || 0,
      averageScore: doc.averageScore || 0,
      attemptCount: doc.attemptCount || 0,
      createdAt: this.dateOrNow(doc.createdAt),
      updatedAt: this.dateOrNow(doc.updatedAt),
    });
  }

  toMockTestQuestionEntity(
    doc: RawMockTestQuestionDoc,
  ): MockTestQuestionEntity {
    return new MockTestQuestionEntity({
      _id: this.toId(doc._id),
      testId: this.toId(doc.testId),
      type: doc.type || 'mcq',
      question: doc.question || '',
      options: doc.options,
      correctAnswer: doc.correctAnswer,
      explanation: doc.explanation,
      difficulty: doc.difficulty || 'easy',
      order: this.numberOrZero(doc.order),
      points: this.numberOrZero(doc.points),
      coding: doc.coding,
    });
  }

  toMockTestAttemptEntity(doc: RawMockTestAttemptDoc): MockTestAttemptEntity {
    return new MockTestAttemptEntity({
      _id: this.toId(doc._id),
      testId: this.toId(doc.testId),
      userId: this.toId(doc.userId),
      status: doc.status || 'in_progress',
      startedAt: this.dateOrNow(doc.startedAt),
      completedAt: doc.completedAt,
      timeTakenSeconds: doc.timeTakenSeconds,
      score: doc.score,
      scorePercentage: doc.scorePercentage,
      passed: doc.passed,
      flaggedQuestions:
        doc.flaggedQuestions?.map((item) => this.toId(item)) || [],
      totalQuestions: this.numberOrZero(doc.totalQuestions),
      answeredQuestions: this.numberOrZero(doc.answeredQuestions),
      createdAt: this.dateOrNow(doc.createdAt),
    });
  }

  toMockTestAnswerEntity(doc: RawMockTestAnswerDoc): MockTestAnswerEntity {
    return new MockTestAnswerEntity({
      _id: this.toId(doc._id),
      attemptId: this.toId(doc.attemptId),
      questionId: this.toId(doc.questionId),
      answer: doc.answer || '',
      isCorrect: doc.isCorrect,
      pointsEarned: doc.pointsEarned,
      aiEvaluationId: this.optionalId(doc.aiEvaluationId),
      submittedAt: this.dateOrNow(doc.submittedAt || doc.createdAt),
    });
  }

  toMockTestAIEvaluationEntity(
    doc: RawMockTestAIEvaluationDoc,
  ): MockTestAIEvaluationEntity {
    return new MockTestAIEvaluationEntity({
      _id: this.toId(doc._id),
      attemptId: this.toId(doc.attemptId),
      questionId: this.toId(doc.questionId),
      answerId: this.toId(doc.answerId),
      score: this.numberOrZero(doc.score),
      maxScore: this.numberOrZero(doc.maxScore),
      feedback: doc.feedback || '',
      status: doc.status || 'pending',
      createdAt: this.dateOrNow(doc.createdAt),
    });
  }

  toMockTestReportEntity(doc: RawMockTestReportDoc): MockTestReportEntity {
    return new MockTestReportEntity({
      _id: this.toId(doc._id),
      attemptId: this.toId(doc.attemptId),
      userId: this.toId(doc.userId),
      testId: this.toId(doc.testId),
      score: this.numberOrZero(doc.score),
      scorePercentage: this.numberOrZero(doc.scorePercentage),
      passed: Boolean(doc.passed),
      timeTakenSeconds: this.numberOrZero(doc.timeTakenSeconds),
      totalQuestions: this.numberOrZero(doc.totalQuestions),
      correctAnswers: this.numberOrZero(doc.correctAnswers),
      incorrectAnswers: this.numberOrZero(doc.incorrectAnswers),
      skippedAnswers: this.numberOrZero(doc.skippedAnswers),
      strongTopics: doc.strongTopics || [],
      weakTopics: doc.weakTopics || [],
      recommendations: doc.recommendations || [],
      createdAt: this.dateOrNow(doc.createdAt),
    });
  }

  toMockTestCreationSessionEntity(
    doc: RawMockTestCreationSessionDoc,
  ): MockTestCreationSessionEntity {
    return new MockTestCreationSessionEntity({
      _id: this.toId(doc._id),
      userId: this.toId(doc.userId),
      status: doc.status || 'draft',
      step: doc.step || 1,
      draftData: doc.draftData || {},
      createdAt: this.dateOrNow(doc.createdAt),
      updatedAt: this.dateOrNow(doc.updatedAt),
    });
  }
}
