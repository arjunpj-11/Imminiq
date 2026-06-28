import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type { CommunityVerificationSubmissionView } from '../dtos/community.dto'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { CommunityMapperContract } from '../mappers/community.mapper'

export class GetVerificationSubmissionUseCase {
  constructor(
    private readonly _repository: CommunityRepositoryContract,
    private readonly _mapper: CommunityMapperContract,
  ) {}

  async execute(
    submissionId: string,
    userId: string,
  ): Promise<CommunityVerificationSubmissionView> {
    const submission = await this._repository.findVerificationSubmissionById(
      submissionId,
      userId,
    )

    if (!submission) {
      throw CommunityApplicationError.notFound('Verification submission not found')
    }

    return this._mapper.toVerificationSubmissionView(submission)
  }
}
