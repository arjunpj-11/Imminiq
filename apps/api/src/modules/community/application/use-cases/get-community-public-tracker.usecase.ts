import type { ICommunityReviewRepository } from '../../domain/repositories/community-review.repository.interface'
import type { CommunityPublicTrackerDetailViewDTO } from '../dtos/community-review.dto'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { ICommunityReviewMapper } from '../mappers/community-review.mapper'

export class GetCommunityPublicTrackerUseCase {
  constructor(
    private readonly _repository: ICommunityReviewRepository,
    private readonly _mapper: ICommunityReviewMapper,
  ) {}

  async execute(
    trackerId: string,
    userId: string,
  ): Promise<CommunityPublicTrackerDetailViewDTO> {
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
