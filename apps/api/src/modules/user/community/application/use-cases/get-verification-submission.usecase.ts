import type { ICommunityVerificationRepository } from '../../domain/repositories/community-verification.repository.interface';
import type { CommunityVerificationSubmissionViewDTO } from '../community.dto';
import { CommunityApplicationError } from '../community-application.error';
import type { ICommunityMapper } from '../community.mapper';

export interface IGetVerificationSubmissionUseCase {
  execute(submissionId: string, userId: string): Promise<CommunityVerificationSubmissionViewDTO>;
}

export class GetVerificationSubmissionUseCase implements IGetVerificationSubmissionUseCase {
  constructor(
    private readonly _repository: ICommunityVerificationRepository,
    private readonly _mapper: ICommunityMapper
  ) {}

  async execute(
    submissionId: string,
    userId: string
  ): Promise<CommunityVerificationSubmissionViewDTO> {
    const submission = await this._repository.findVerificationSubmissionById(submissionId, userId);

    if (!submission) {
      throw CommunityApplicationError.notFound('Verification submission not found');
    }

    return this._mapper.toVerificationSubmissionView(submission);
  }
}
