import crypto from 'crypto'

import { ApiError } from '../../../../shared/utils/ApiError'
import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'

const createShareToken = (): string => crypto.randomBytes(24).toString('base64url')

export class ShareMockTestUseCase {
  constructor(private readonly repo: MockTestsRepositoryContract) {}

  async execute(input: {
    userId: string
    testId: string
    origin: string
  }) {
    const test = await this.repo.findTestById(input.testId)

    if (!test || test.ownerId !== input.userId) {
      throw new ApiError(404, 'Mock test not found', 'MOCK_TEST_NOT_FOUND')
    }

    if (test.shareToken && test.isShareEnabled) {
      return {
        shareToken: test.shareToken,
        shareUrl: `${input.origin}/mock-tests/shared/${test.shareToken}`,
      }
    }

    const shareToken = createShareToken()

    const updatedTest = await this.repo.enableTestSharing(
      input.userId,
      input.testId,
      shareToken,
    )

    if (!updatedTest?.shareToken) {
      throw new ApiError(500, 'Failed to create share link', 'SHARE_LINK_FAILED')
    }

    return {
      shareToken: updatedTest.shareToken,
      shareUrl: `${input.origin}/mock-tests/shared/${updatedTest.shareToken}`,
    }
  }
}