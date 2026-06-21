import type { MockTestCreationSessionEntity } from '../entities/mock-test-creation-session.entity'
import type { CreationSessionStatus } from '../value-objects/creation-session-status.vo'
import type { DifficultyLevel } from '../value-objects/difficulty-level.vo'
import type { TestVisibility } from '../value-objects/test-visibility.vo'

export type CreateMockTestCreationSessionInput = {
  userId: string
}

export type UpdateMockTestCreationSessionInput = {
  title?: string
  description?: string
  difficulty?: DifficultyLevel
  visibility?: TestVisibility
  timeLimitMinutes?: number
  passingScore?: number
  questionCount?: number
  tags?: string[]
  trackerId?: string
  generatedTestId?: string
  status?: CreationSessionStatus
  completedAt?: Date
  cancelledAt?: Date
}

export interface MockTestCreationSessionRepositoryContract {
  findCreationSession(
    sessionId: string
  ): Promise<MockTestCreationSessionEntity | null>

  findActiveCreationSession(
    userId: string
  ): Promise<MockTestCreationSessionEntity | null>

  createCreationSession(
    data: CreateMockTestCreationSessionInput
  ): Promise<MockTestCreationSessionEntity>

  updateCreationSession(
    sessionId: string,
    data: UpdateMockTestCreationSessionInput
  ): Promise<MockTestCreationSessionEntity | null>

  cancelCreationSession(sessionId: string): Promise<void>
}