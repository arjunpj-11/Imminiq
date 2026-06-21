import type { MockTestAnswerEntity } from '../entities/mock-test-answer.entity'

export type SaveMockTestAnswerInput = {
  attemptId: string
  questionId: string
  answer: string
  isCorrect?: boolean
  pointsEarned?: number
}

export type FindMockTestAnswerByQuestionInput = {
  attemptId: string
  questionId: string
}

export type UpdateMockTestAnswerInput = {
  answer?: string
  isCorrect?: boolean
  pointsEarned?: number
}

export type MockTestQuestionFlagInput = {
  attemptId: string
  questionId: string
}

export interface MockTestAnswerRepositoryContract {
  findAnswersByAttempt(attemptId: string): Promise<MockTestAnswerEntity[]>

  findAnswerByQuestion(
    input: FindMockTestAnswerByQuestionInput
  ): Promise<MockTestAnswerEntity | null>

  saveAnswer(data: SaveMockTestAnswerInput): Promise<MockTestAnswerEntity>

  updateAnswer(
    answerId: string,
    data: UpdateMockTestAnswerInput
  ): Promise<MockTestAnswerEntity | null>

  flagQuestion(input: MockTestQuestionFlagInput): Promise<void>

  unflagQuestion(input: MockTestQuestionFlagInput): Promise<void>
}