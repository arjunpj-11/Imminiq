import type { IMockTestSharingRepository } from '../../domain/repositories/mock-test-sharing.repository.interface'
import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface'
import type { IShareTokenGenerator } from '../../domain/services/share-token-generator.interface'
import { MockTestsApplicationError } from '../errors/mock-tests-application.error'

type ShareMockTestRepository =
  IMockTestRepository &
  IMockTestSharingRepository

export interface IShareMockTestUseCase {
  execute(input: { userId: string; testId: string; origin: string }): Promise<{ shareToken: string; shareUrl: string; }>
}

export class ShareMockTestUseCase implements IShareMockTestUseCase {
  constructor(
    private readonly _repository: ShareMockTestRepository,
    private readonly _shareTokenGenerator: IShareTokenGenerator,
  ) {}

  async execute(input: { userId: string; testId: string; origin: string }) {
    const test = await this._repository.findTestById(input.testId)

    if (!test || test.ownerId !== input.userId) {
      throw MockTestsApplicationError.mockTestNotFound()
    }

    if (test.shareToken && test.isShareEnabled) {
      return {
        shareToken: test.shareToken,
        shareUrl: `${input.origin}/mock-tests/shared/${test.shareToken}`,
      }
    }

    const shareToken = this._shareTokenGenerator.generate()

    const updatedTest = await this._repository.enableTestSharing({
      ownerId: input.userId,
      testId: input.testId,
      shareToken,
    })

    if (!updatedTest?.shareToken) {
      throw MockTestsApplicationError.shareLinkFailed()
    }

    return {
      shareToken: updatedTest.shareToken,
      shareUrl: `${input.origin}/mock-tests/shared/${updatedTest.shareToken}`,
    }
  }
}