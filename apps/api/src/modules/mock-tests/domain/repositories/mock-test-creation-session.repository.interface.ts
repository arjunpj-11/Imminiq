import type { MockTestCreationSessionEntity } from '../entities/mock-test-creation-session.entity'

export interface MockTestCreationSessionRepositoryContract {
  findCreationSession(sessionId: string): Promise<MockTestCreationSessionEntity | null>
  findActiveCreationSession(userId: string): Promise<MockTestCreationSessionEntity | null>
  createCreationSession(userId: string): Promise<MockTestCreationSessionEntity>
  updateCreationSession(sessionId: string, data: Partial<MockTestCreationSessionEntity>): Promise<MockTestCreationSessionEntity | null>
  cancelCreationSession(sessionId: string): Promise<void>
}
