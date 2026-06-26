import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type { CommunityVerificationSubmissionView } from '../dtos/community.dto'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { CommunityMapperContract } from '../mappers/community.mapper'

export class GetVerificationSubmissionUseCase {
  constructor(
    private readonly repository: CommunityRepositoryContract,
    private readonly mapper: CommunityMapperContract,
  ) {}

  async execute(
    submissionId: string,
    userId: string,
  ): Promise<CommunityVerificationSubmissionView> {
    const submission = await this.repository.findVerificationSubmissionById(
      submissionId,
      userId,
    )

    if (!submission) {
      throw CommunityApplicationError.notFound('Verification submission not found')
    }

    return this.mapper.toVerificationSubmissionView(submission)
  }
}
