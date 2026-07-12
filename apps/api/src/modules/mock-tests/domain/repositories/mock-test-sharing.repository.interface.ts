import type { MockTestEntity } from '../entities/mock-test.entity'

export type FindImportedSharedTestInput = {
  ownerId: string
  sourceTestId: string
}

export type EnableMockTestSharingInput = {
  ownerId: string
  testId: string
  shareToken: string
}

export interface IMockTestSharingRepository {
  findSharedTestByToken(shareToken: string): Promise<MockTestEntity | null>

  findImportedSharedTest(
    input: FindImportedSharedTestInput
  ): Promise<MockTestEntity | null>

  enableTestSharing(
    input: EnableMockTestSharingInput
  ): Promise<MockTestEntity | null>

  incrementCloneCount(testId: string): Promise<void>
}