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
