export type AdaptiveMasteryLevel = 'foundation' | 'developing' | 'proficient' | 'advanced';

export type AdaptiveDifficulty = 'easy' | 'medium' | 'hard';

export type AdaptiveTrackerSnapshot = {
  id: string;
  title: string;
  field: string;
  goal: string;
  level: string;
  progressPercent: number;
  lastStudiedAt?: Date;
};

export type AdaptivePerformanceSnapshot = {
  testId: string;
  title: string;
  scorePercentage: number;
  weakTopics: string[];
  strongTopics: string[];
  completedAt: Date;
};

export type AdaptiveLearnerSnapshot = {
  user: {
    fullName: string;
    xpLevel: number;
    xp: number;
    streakCount: number;
  };
  trackers: AdaptiveTrackerSnapshot[];
  recentPerformance: AdaptivePerformanceSnapshot[];
  averageScore: number | null;
};

export type AdaptiveLevelHistoryEntry = {
  id: string;
  masteryScore: number;
  level: AdaptiveMasteryLevel;
  change: number;
  reason: string;
  recordedAt: Date;
};

export type AdaptiveProfile = {
  masteryScore: number;
  level: AdaptiveMasteryLevel;
  history: AdaptiveLevelHistoryEntry[];
};

export type AdaptiveAssessmentPlan = {
  topic: string;
  trackerId?: string;
  difficulty: AdaptiveDifficulty;
  questionCount: number;
  predictedScore: number;
  rationale: string;
  focusAreas: string[];
};

export type AdaptiveAssessment = AdaptiveAssessmentPlan & {
  id: string;
  testId: string;
  baselineMasteryScore: number;
  status: 'ready' | 'completed';
  actualScore?: number;
  masteryChange?: number;
  createdAt: Date;
  completedAt?: Date;
};

export type AdaptiveAdvisorMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
};

export type AdaptiveAdvisorAction =
  | {
      type: 'create_tracker';
      label: string;
      topic: string;
      goal: string;
      level: 'beginner' | 'intermediate' | 'advanced';
    }
  | {
      type: 'create_mock_test';
      label: string;
      topic: string;
      difficulty: AdaptiveDifficulty;
      questionCount: number;
      trackerId?: string;
    };

export type AdaptiveAdvisorAnswer = {
  content: string;
  action?: AdaptiveAdvisorAction;
};
