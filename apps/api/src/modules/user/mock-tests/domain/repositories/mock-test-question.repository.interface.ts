import type { MockTestQuestionEntity } from '../entities/mock-test-question.entity';
import type { DifficultyLevel } from '../value-objects/difficulty-level.vo';
import type { MockTestCodingDetails } from '../value-objects/mock-test-coding.vo';
import type { QuestionType } from '../value-objects/question-type.vo';

export type CreateMockTestQuestionInput = {
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
};

export interface IMockTestQuestionRepository {
  findQuestionsByTest(testId: string): Promise<MockTestQuestionEntity[]>;

  findQuestionById(questionId: string): Promise<MockTestQuestionEntity | null>;

  createQuestions(questions: CreateMockTestQuestionInput[]): Promise<MockTestQuestionEntity[]>;
}
