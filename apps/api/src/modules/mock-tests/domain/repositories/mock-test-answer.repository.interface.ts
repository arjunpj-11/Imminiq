import type { MockTestAnswerEntity } from '../entities/mock-test-answer.entity'

export interface SaveMockTestAnswerInput {
  attemptId: string
  questionId: string
  answer: string
  isCorrect?: boolean
  pointsEarned?: number
}

export interface MockTestAnswerRepositoryContract {
  findAnswersByAttempt(attemptId: string): Promise<MockTestAnswerEntity[]>
  findAnswerByQuestion(attemptId: string, questionId: string): Promise<MockTestAnswerEntity | null>
  saveAnswer(data: SaveMockTestAnswerInput): Promise<MockTestAnswerEntity>
  updateAnswer(answerId: string, data: Partial<MockTestAnswerEntity>): Promise<MockTestAnswerEntity | null>
  flagQuestion(attemptId: string, questionId: string): Promise<void>
  unflagQuestion(attemptId: string, questionId: string): Promise<void>
}
