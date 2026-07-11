import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface'
import type { ICommunityVerificationSubmissionViewDTO } from '../dtos/community.dto'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { ICommunityMapper } from '../mappers/community.mapper'

export class GetVerificationSubmissionUseCase {
  constructor(
    private readonly _repository: ICommunityRepository,
    private readonly _mapper: ICommunityMapper,
  ) {}

  async execute(
    submissionId: string,
    userId: string,
  ): Promise<ICommunityVerificationSubmissionViewDTO> {
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
