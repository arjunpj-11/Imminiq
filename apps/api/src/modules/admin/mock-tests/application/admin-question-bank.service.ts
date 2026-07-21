import type { AdminActor, AdminPage } from '../../../../shared/admin';

export type AdminQuestionBankQuery = {
  search?: string;
  topic?: string;
  type?: 'all' | 'mcq' | 'short_answer' | 'coding';
  difficulty?: 'all' | 'easy' | 'medium' | 'hard';
  page: number;
  limit: number;
};

export type AdminQuestionBankItem = {
  id: string;
  bankId: number;
  topic: string;
  type: string;
  question: string;
  difficulty: string;
  points: number;
  usageCount: number;
  createdAt: Date;
};

export type AdminQuestionBankDetail = AdminQuestionBankItem & {
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  coding?: Record<string, unknown>;
  attemptCount: number;
  uniqueLearnerCount: number;
  correctCount: number;
  incorrectCount: number;
  pendingEvaluationCount: number;
  flagCount: number;
};

export type AdminQuestionBankMutationInput = {
  bankId: number;
  reason: string;
  actor: AdminActor;
};

export type AdminQuestionBankRemoveResult = {
  bankId: number;
  removedFromTests: number;
  affectedTests: number;
};

export type AdminQuestionBankRestoreResult = {
  bankId: number;
  restoredInTests: number;
  affectedTests: number;
};

export interface IAdminQuestionBankService {
  list(query: AdminQuestionBankQuery): Promise<AdminPage<AdminQuestionBankItem>>;
  get(bankId: number): Promise<AdminQuestionBankDetail>;
  remove(input: AdminQuestionBankMutationInput): Promise<AdminQuestionBankRemoveResult>;
  restore(input: AdminQuestionBankMutationInput): Promise<AdminQuestionBankRestoreResult>;
}
