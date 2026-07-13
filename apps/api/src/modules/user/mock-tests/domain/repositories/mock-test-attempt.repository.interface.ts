import type { MockTestAttemptEntity } from '../entities/mock-test-attempt.entity'
import type { AttemptStatus } from '../value-objects/attempt-status.vo'

export type CreateMockTestAttemptInput = {
  testId: string
  userId: string
  totalQuestions: number
}

export type FindMockTestAttemptsByUserInput = {
  userId: string
  testId?: string
}

export type FindLatestMockTestAttemptsInput = {
  userId: string
  testIds: string[]
}

export type FindActiveMockTestAttemptInput = {
  userId: string
  testId: string
}

export type UpdateMockTestAttemptInput = {
  status?: AttemptStatus

  score?: number
  maxScore?: number
  percentage?: number
  passed?: boolean

  answeredCount?: number
  correctCount?: number

  startedAt?: Date
  completedAt?: Date
  abandonedAt?: Date

  timeSpentSeconds?: number
}

export type AbandonActiveMockTestAttemptsInput = {
  userId: string
  testId: string
}

export interface IMockTestAttemptRepository {
  findAttemptById(
    attemptId: string,
  ): Promise<MockTestAttemptEntity | null>

  findAttemptsByUser(
    input: FindMockTestAttemptsByUserInput,
  ): Promise<MockTestAttemptEntity[]>

  findLatestAttemptsForTests(
    input: FindLatestMockTestAttemptsInput,
  ): Promise<Record<string, MockTestAttemptEntity>>

  findActiveAttempt(
    input: FindActiveMockTestAttemptInput,
  ): Promise<MockTestAttemptEntity | null>

  createAttempt(
    data: CreateMockTestAttemptInput,
  ): Promise<MockTestAttemptEntity>

  updateAttempt(
    attemptId: string,
    data: UpdateMockTestAttemptInput,
  ): Promise<MockTestAttemptEntity | null>

  incrementAnsweredCount(
    attemptId: string,
  ): Promise<void>

  abandonActiveAttempts(
    input: AbandonActiveMockTestAttemptsInput,
  ): Promise<void>
}