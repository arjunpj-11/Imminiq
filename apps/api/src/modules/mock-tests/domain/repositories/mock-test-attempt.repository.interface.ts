import type { MockTestAttemptEntity } from '../entities/mock-test-attempt.entity'

export interface CreateMockTestAttemptInput {
  testId: string
  userId: string
  totalQuestions: number
}

export interface MockTestAttemptRepositoryContract {
  findAttemptById(attemptId: string): Promise<MockTestAttemptEntity | null>
  findAttemptsByUser(userId: string, testId?: string): Promise<MockTestAttemptEntity[]>
  findLatestAttemptsForTests(userId: string, testIds: string[]): Promise<Record<string, MockTestAttemptEntity>>
  findActiveAttempt(userId: string, testId: string): Promise<MockTestAttemptEntity | null>
  createAttempt(data: CreateMockTestAttemptInput): Promise<MockTestAttemptEntity>
  updateAttempt(attemptId: string, data: Partial<MockTestAttemptEntity>): Promise<MockTestAttemptEntity | null>
  incrementAnsweredCount(attemptId: string): Promise<void>
  abandonActiveAttempts(userId: string, testId: string): Promise<void>
}
