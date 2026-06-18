import type { MockTestEntity } from '../entities/mock-test.entity'

export interface MockTestSharingRepositoryContract {
  findSharedTestByToken(shareToken: string): Promise<MockTestEntity | null>
  findImportedSharedTest(ownerId: string, sourceTestId: string): Promise<MockTestEntity | null>
  enableTestSharing(ownerId: string, testId: string, shareToken: string): Promise<MockTestEntity | null>
  incrementCloneCount(testId: string): Promise<void>
}
