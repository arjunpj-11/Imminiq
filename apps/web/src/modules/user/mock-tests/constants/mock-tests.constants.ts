import type { DifficultyLevel, QuestionType } from '../types/mock-tests.types';

export const MOCK_TEST_FILTERS = ['All', 'Passed', 'High score', 'In progress'] as const;
export type MockTestFilter = (typeof MOCK_TEST_FILTERS)[number];
export const DIFFICULTY_OPTIONS: DifficultyLevel[] = ['easy', 'medium', 'hard'];
export const QUESTION_TYPE_OPTIONS: QuestionType[] = ['mcq', 'short_answer', 'coding'];
export const MAX_MOCK_TEST_QUESTIONS = 50;
export const DEFAULT_GENERATE_FORM = {
  topic: '',
  difficulty: 'medium' as DifficultyLevel,
  questionCount: 10,
  timeLimitMinutes: 30,
  questionTypes: ['mcq'] as QuestionType[],
};

export const MOCK_TEST_API_PATHS = {
  root: '/mock-tests',
  generate: '/mock-tests/generate',
  activeGeneration: '/mock-tests/generation/active',
  history: '/mock-tests/history',
  analyticsTrends: '/mock-tests/analytics/trends',
  analyticsAiInsights: '/mock-tests/analytics/ai-insights',
  analyticsTopicBreakdown: '/mock-tests/analytics/topic-breakdown',
  detail: (testId: string) => `/mock-tests/${testId}`,
  start: (testId: string) => `/mock-tests/${testId}/start`,
  share: (testId: string) => `/mock-tests/${testId}/share`,
  importShared: (shareToken: string) => `/mock-tests/shared/${shareToken}/import`,
  attemptQuestions: (attemptId: string) => `/mock-tests/attempts/${attemptId}/questions`,
  submitAnswer: (attemptId: string) => `/mock-tests/attempts/${attemptId}/answers`,
  flagQuestion: (attemptId: string) => `/mock-tests/attempts/${attemptId}/flag`,
  finishAttempt: (attemptId: string) => `/mock-tests/attempts/${attemptId}/finish`,
  attemptResult: (attemptId: string) => `/mock-tests/attempts/${attemptId}/result`,
  attemptAnalysis: (attemptId: string) => `/mock-tests/attempts/${attemptId}/analysis`,
  retakeAttempt: (attemptId: string) => `/mock-tests/attempts/${attemptId}/retake`,
  runCode: (attemptId: string, questionId: string) =>
    `/mock-tests/attempts/${attemptId}/questions/${questionId}/run-code`,
  submitCode: (attemptId: string, questionId: string) =>
    `/mock-tests/attempts/${attemptId}/questions/${questionId}/submit-code`,
} as const;
