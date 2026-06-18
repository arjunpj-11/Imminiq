import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import type { MockTestSharingRepositoryContract } from '../../domain/repositories/mock-test-sharing.repository.interface'
import type { ShareTokenGeneratorServiceContract } from '../../domain/services/share-token-generator.service.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type ShareMockTestRepository =
  MockTestRepositoryContract &
  MockTestSharingRepositoryContract

export class ShareMockTestUseCase {
  constructor(
    private readonly repo: ShareMockTestRepository,
    private readonly shareTokenGenerator: ShareTokenGeneratorServiceContract,
  ) { }

  async execute(input: {
    userId: string
    testId: string
    origin: string
  }) {
    const test = await this.repo.findTestById(input.testId)

    if (!test || test.ownerId !== input.userId) {
      throw MockTestsApplicationError.mockTestNotFound()
    }

    if (test.shareToken && test.isShareEnabled) {
      return {
        shareToken: test.shareToken,
        shareUrl: `${input.origin}/mock-tests/shared/${test.shareToken}`,
      }
    }

    const shareToken = this.shareTokenGenerator.generate()

    const updatedTest = await this.repo.enableTestSharing(
      input.userId,
      input.testId,
      shareToken,
    )

    if (!updatedTest?.shareToken) {
      throw MockTestsApplicationError.shareLinkFailed()
    }

    return {
      shareToken: updatedTest.shareToken,
      shareUrl: `${input.origin}/mock-tests/shared/${updatedTest.shareToken}`,
    }
  }

}
