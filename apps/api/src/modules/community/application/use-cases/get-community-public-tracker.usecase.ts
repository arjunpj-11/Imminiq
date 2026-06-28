import type { CommunityReviewRepositoryContract } from '../../domain/repositories/community-review.repository.interface'
import type { CommunityPublicTrackerDetailView } from '../dtos/community-review.dto'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { CommunityReviewMapperContract } from '../mappers/community-review.mapper'

export class GetCommunityPublicTrackerUseCase {
  constructor(
    private readonly _repository: CommunityReviewRepositoryContract,
    private readonly _mapper: CommunityReviewMapperContract,
  ) {}

  async execute(
    trackerId: string,
    userId: string,
  ): Promise<CommunityPublicTrackerDetailView> {
    const tracker = await this._repository.findPublicTrackerDetail(
      trackerId,
      userId,
    )

    if (!tracker) {
      throw CommunityApplicationError.notFound('Community tracker not found')
    }

    return this._mapper.toPublicTrackerDetailView(tracker)
  }
}
