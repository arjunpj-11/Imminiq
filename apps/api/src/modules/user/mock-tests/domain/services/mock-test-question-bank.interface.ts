import type { DifficultyLevel } from '../value-objects/difficulty-level.vo';
import type { MockTestCodingDetails } from '../value-objects/mock-test-coding.vo';
import type { QuestionType } from '../value-objects/question-type.vo';

export type QuestionBankItem = {
  bankId?: number;
  topic?: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: DifficultyLevel;
  points: number;
  coding?: MockTestCodingDetails;
};

export interface IMockTestQuestionBank {
  shouldUseAI(): boolean;
  saveToQuestionBank(
    topic: string,
    questions: Omit<QuestionBankItem, 'bankId' | 'topic'>[]
  ): Promise<QuestionBankItem[]>;
  sampleFromQuestionBank(
    topic: string,
    count: number,
    difficulty?: DifficultyLevel,
    questionTypes?: QuestionType[]
  ): Promise<QuestionBankItem[]>;
}
