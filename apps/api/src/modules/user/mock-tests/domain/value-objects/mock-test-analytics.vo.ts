import type { AttemptStatus } from './attempt-status.vo';
import type { DifficultyLevel } from './difficulty-level.vo';

export type MockTestHistoryTest = {
  _id: string;
  ownerId: string;
  trackerId?: string;
  sourceTestId?: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  moderationStatus?: 'active' | 'suspended' | 'deleted';
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
};

export type MockTestAttemptHistoryItem = {
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
  test: MockTestHistoryTest | null;
};

export type MockTestSummary = {
  totalTests: number;
  completedAttempts: number;
  averageScore: number;
  bestScore: number;
  totalQuestions: number;
  passedAttempts: number;
};

export type MockTestPerformanceTrend = {
  date: string;
  averageScore: number;
  attempts: number;
};

export type MockTestTopicBreakdown = {
  topic: string;
  averageScore: number;
  totalAttempts: number;
};
