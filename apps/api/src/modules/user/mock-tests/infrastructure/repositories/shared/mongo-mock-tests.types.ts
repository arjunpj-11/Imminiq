import type { AttemptStatus } from '../../../domain/value-objects/attempt-status.vo';
import type { CreationSessionStatus } from '../../../domain/value-objects/creation-session-status.vo';
import type { DifficultyLevel } from '../../../domain/value-objects/difficulty-level.vo';
import type { EvaluationStatus } from '../../../domain/value-objects/evaluation-status.vo';
import type { MockTestCodingDetails } from '../../../domain/value-objects/mock-test-coding.vo';
import type { MockTestCreationDraft } from '../../../domain/value-objects/mock-test-creation-draft.vo';
import type { QuestionType } from '../../../domain/value-objects/question-type.vo';

export type RawRecord = Record<string, unknown>;

export type RawMockTestDoc = {
  _id?: unknown;
  ownerId?: unknown;
  trackerId?: unknown;
  sourceTestId?: unknown;
  title?: string;
  description?: string;
  difficulty?: DifficultyLevel;
  moderationStatus?: 'active' | 'suspended' | 'deleted';
  moderationReason?: string;
  questionCount?: number;
  timeLimitMinutes?: number;
  passingScore?: number;
  isAIGenerated?: boolean;
  tags?: string[];
  shareToken?: string;
  isShareEnabled?: boolean;
  cloneCount?: number;
  averageScore?: number;
  attemptCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type RawMockTestQuestionDoc = {
  _id?: unknown;
  testId?: unknown;
  type?: QuestionType;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: DifficultyLevel;
  order?: number;
  points?: number;
  coding?: MockTestCodingDetails;
  version?: number;
};

export type RawMockTestAttemptDoc = {
  _id?: unknown;
  testId?: unknown;
  userId?: unknown;
  status?: AttemptStatus;
  startedAt?: Date;
  completedAt?: Date;
  timeTakenSeconds?: number;
  score?: number;
  scorePercentage?: number;
  passed?: boolean;
  flaggedQuestions?: unknown[];
  totalQuestions?: number;
  answeredQuestions?: number;
  questionSnapshot?: Array<{
    _id: string;
    testId: string;
    type: QuestionType;
    question: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    difficulty: DifficultyLevel;
    order: number;
    points: number;
    coding?: MockTestCodingDetails;
    version: number;
  }>;
  createdAt?: Date;
};

export type RawMockTestAnswerDoc = {
  _id?: unknown;
  attemptId?: unknown;
  questionId?: unknown;
  answer?: string;
  isCorrect?: boolean;
  pointsEarned?: number;
  aiEvaluationId?: unknown;
  submittedAt?: Date;
  createdAt?: Date;
};

export type RawMockTestAIEvaluationDoc = {
  _id?: unknown;
  attemptId?: unknown;
  questionId?: unknown;
  answerId?: unknown;
  score?: number;
  maxScore?: number;
  feedback?: string;
  status?: EvaluationStatus;
  createdAt?: Date;
};

export type RawMockTestReportDoc = {
  _id?: unknown;
  attemptId?: unknown;
  userId?: unknown;
  testId?: unknown;
  score?: number;
  scorePercentage?: number;
  passed?: boolean;
  timeTakenSeconds?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  skippedAnswers?: number;
  strongTopics?: string[];
  weakTopics?: string[];
  recommendations?: string[];
  createdAt?: Date;
};

export type RawMockTestCreationSessionDoc = {
  _id?: unknown;
  userId?: unknown;
  status?: CreationSessionStatus;
  step?: number;
  draftData?: MockTestCreationDraft;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserSummaryAggregation = {
  completedAttempts?: number;
  averageScore?: number;
  bestScore?: number;
  passedAttempts?: number;
};

export type PerformanceTrendAggregation = {
  _id: string;
  averageScore: number;
  attempts: number;
};

export type AnalyticsSnapshotAggregation = {
  totalAttempts: number;
  averageScore: number;
  passCount: number;
  averageTimeTaken?: number;
};

export type QuestionCountDoc = {
  questionCount?: number;
};

export type MongoDuplicateKeyError = {
  code?: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
};
