import type { AttemptStatus } from '../domain/value-objects/attempt-status.vo';
import type { CreationSessionStatus } from '../domain/value-objects/creation-session-status.vo';
import type { DifficultyLevel } from '../domain/value-objects/difficulty-level.vo';
import type { EvaluationStatus } from '../domain/value-objects/evaluation-status.vo';
import type { MockTestCodingDetails } from '../domain/value-objects/mock-test-coding.vo';
import type { MockTestCreationDraft } from '../domain/value-objects/mock-test-creation-draft.vo';
import type { MockTestCodingLanguage } from '../domain/value-objects/coding-language.vo';
import type { QuestionType } from '../domain/value-objects/question-type.vo';

export type {
  DifficultyLevel,
  MockTestCodingDetails,
  MockTestCodingLanguage,
  QuestionType,
};

export interface MockTestDTO {
  _id: string;
  ownerId: string;
  trackerId?: string;
  sourceTestId?: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  moderationStatus: 'active' | 'suspended' | 'deleted';
  moderationReason?: string;
  questionCount: number;
  timeLimitMinutes: number;
  passingScore: number;
  isAIGenerated: boolean;
  tags: string[];
  shareToken?: string;
  isShareEnabled: boolean;
  cloneCount: number;
  averageScore: number;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockTestQuestionDTO {
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
}

export type PublicMockTestQuestionDTO = Omit<MockTestQuestionDTO, 'correctAnswer' | 'explanation'>;

export type PublicMockTestDTO = Omit<MockTestDTO, 'shareToken'>;

export interface MockTestAttemptDTO {
  _id: string;
  testId: string;
  userId: string;
  status: AttemptStatus;
  startedAt: Date;
  completedAt?: Date;
  timeTakenSeconds?: number;
  score?: number;
  scorePercentage?: number;
  passed?: boolean;
  flaggedQuestions: string[];
  totalQuestions: number;
  answeredQuestions: number;
  createdAt: Date;
}

export interface MockTestAnswerDTO {
  _id: string;
  attemptId: string;
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  pointsEarned?: number;
  aiEvaluationId?: string;
  submittedAt: Date;
}

export interface MockTestAIEvaluationDTO {
  _id: string;
  attemptId: string;
  questionId: string;
  answerId: string;
  score: number;
  maxScore: number;
  feedback: string;
  status: EvaluationStatus;
  createdAt: Date;
}

export interface MockTestReportDTO {
  _id: string;
  attemptId: string;
  userId: string;
  testId: string;
  score: number;
  scorePercentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  strongTopics: string[];
  weakTopics: string[];
  recommendations: string[];
  createdAt: Date;
}

export interface MockTestCreationSessionDTO {
  _id: string;
  userId: string;
  status: CreationSessionStatus;
  step: number;
  draftData: MockTestCreationDraft;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMockTestPayloadDTO {
  title: string;
  description?: string;
  difficulty?: DifficultyLevel;
  timeLimitMinutes?: number;
  passingScore?: number;
  tags?: string[];
  trackerId?: string;
  questions: {
    type: QuestionType;
    question: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    difficulty?: DifficultyLevel;
    points?: number;
    coding?: MockTestCodingDetails;
  }[];
}

export interface GenerateMockTestPayloadDTO {
  topic: string;
  difficulty?: DifficultyLevel;
  questionCount?: number;
  questionTypes?: QuestionType[];
  trackerId?: string;
  topicId?: string;
  timeLimitMinutes?: number;
  passingScore?: number;
  runInBackground?: boolean;
}

export interface MockTestGenerationJobDTO {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface SubmitAnswerPayloadDTO {
  questionId: string;
  answer: string;
}

export interface RunMockTestCodePayloadDTO {
  sourceCode: string;
  language?: MockTestCodingLanguage;
  languageId?: number;
}

export type SubmitMockTestCodePayloadDTO = RunMockTestCodePayloadDTO;

export interface MockTestSummaryDTO {
  totalTests: number;
  completedAttempts: number;
  averageScore: number;
  bestScore: number;
  totalQuestions: number;
  passedAttempts: number;
}

export interface TestAttemptResultDTO {
  attempt: MockTestAttemptDTO;
  report: MockTestReportDTO | null;
  answers: (MockTestAnswerDTO & {
    question?: MockTestQuestionDTO;
    aiEvaluation?: MockTestAIEvaluationDTO;
  })[];
}

export interface TestAnalyticsDTO {
  trends: { date: string; averageScore: number; attempts: number }[];
  topicBreakdown: { topic: string; averageScore: number; totalAttempts: number }[];
  aiInsights: string;
}

export interface AttemptAnalysisDTO {
  score: number;
  scorePercentage: number;
  passed: boolean;
  strongTopics: string[];
  weakTopics: string[];
  recommendations: string[];
  questionBreakdown: {
    questionId: string;
    question: string;
    isCorrect: boolean;
    yourAnswer: string;
    correctAnswer?: string;
    explanation?: string;
    pointsEarned: number;
    maxPoints: number;
  }[];
}

export interface MockTestListDTO {
  tests: MockTestDTO[];
  total: number;
}

export interface PublicMockTestListDTO {
  tests: PublicMockTestDTO[];
  total: number;
}

export interface MockTestDetailsDTO {
  test: MockTestDTO | PublicMockTestDTO;
  questions: MockTestQuestionDTO[] | PublicMockTestQuestionDTO[];
  latestAttempt: MockTestAttemptDTO | null;
}

export interface MockTestAttemptSessionDTO {
  attempt: MockTestAttemptDTO;
  questions: PublicMockTestQuestionDTO[];
}

export interface FinishMockTestAttemptDTO {
  attempt: MockTestAttemptDTO;
  report: MockTestReportDTO;
  scoreResult: {
    totalPoints: number;
    earnedPoints: number;
    scorePercentage: number;
    correctCount: number;
    incorrectCount: number;
    skippedCount: number;
    passed: boolean;
  };
}

export interface ImportSharedMockTestDTO {
  test: MockTestDTO;
  imported: boolean;
  alreadyImported: boolean;
}

export interface MockTestAttemptHistoryDTO extends MockTestAttemptDTO {
  test: MockTestDTO | null;
}
