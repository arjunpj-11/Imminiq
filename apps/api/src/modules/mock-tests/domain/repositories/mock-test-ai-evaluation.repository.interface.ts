import type { MockTestAIEvaluationEntity } from '../entities/mock-test-ai-evaluation.entity'

export interface CreateMockTestAIEvaluationInput {
  attemptId: string
  questionId: string
  answerId: string
  score: number
  maxScore: number
  feedback: string
}

export interface MockTestAIEvaluationRepositoryContract {
  createAIEvaluation(data: CreateMockTestAIEvaluationInput): Promise<MockTestAIEvaluationEntity>
  findAIEvaluationsByAttempt(attemptId: string): Promise<MockTestAIEvaluationEntity[]>
}
