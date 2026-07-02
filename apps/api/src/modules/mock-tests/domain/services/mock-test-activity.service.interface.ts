import type { DifficultyLevel } from '../value-objects/difficulty-level.vo'

export type RecordMockTestGeneratedActivityInput = {
  userId: string
  mockTestId: string
  trackerId?: string

  testTitle: string
  difficulty: DifficultyLevel
  totalQuestions: number

  utcOffsetMinutes?: number
}

export type RecordMockTestCompletedActivityInput = {
  userId: string
  mockTestId: string
  attemptId: string
  trackerId?: string

  testTitle: string
  difficulty: DifficultyLevel

  scorePercentage: number
  totalQuestions: number
  correctAnswers: number
  durationSeconds: number
  passed: boolean

  xpAwarded: number
  utcOffsetMinutes?: number
}

export interface MockTestActivityServiceContract {
  recordMockTestGenerated(
    input: RecordMockTestGeneratedActivityInput,
  ): Promise<void>

  recordMockTestCompleted(
    input: RecordMockTestCompletedActivityInput,
  ): Promise<void>
}