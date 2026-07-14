import type { DifficultyLevel } from './difficulty-level.vo';
import type { QuestionType } from './question-type.vo';
import type { TestVisibility } from './test-visibility.vo';

export type MockTestCreationDraft = {
  title?: string;
  description?: string;
  difficulty?: DifficultyLevel;
  questionCount?: number;
  timeLimitMinutes?: number;
  passingScore?: number;
  tags?: string[];
  trackerId?: string;
  topicId?: string;
  visibility?: TestVisibility;
  questionTypes?: QuestionType[];
};
