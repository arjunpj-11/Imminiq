import type { AdaptiveMasteryLevel } from '../../../domain/adaptive-learning.types';

export type MongoAdaptiveId = { toString(): string };

export type MongoAdaptiveProfileRecord = {
  masteryScore: number;
  level: AdaptiveMasteryLevel;
  history?: Array<{
    _id: MongoAdaptiveId;
    masteryScore: number;
    level: AdaptiveMasteryLevel;
    change: number;
    reason: string;
    recordedAt: Date;
  }>;
};

export type MongoAdaptiveAssessmentRecord = {
  _id: MongoAdaptiveId;
  testId: MongoAdaptiveId;
  trackerId?: MongoAdaptiveId | null;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  predictedScore: number;
  rationale: string;
  focusAreas?: string[];
  baselineMasteryScore: number;
  status: 'ready' | 'completed';
  actualScore?: number | null;
  masteryChange?: number | null;
  createdAt: Date;
  completedAt?: Date | null;
};

export type MongoAdaptiveAdvisorMessageRecord = {
  _id: MongoAdaptiveId;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
};
