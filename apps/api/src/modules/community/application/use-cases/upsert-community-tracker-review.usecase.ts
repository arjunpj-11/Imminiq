import type { ICommunityReviewRepository } from '../../domain/repositories/community-review.repository.interface'
import type {
  UpsertCommunityTrackerReviewOutputDTO,
  UpsertCommunityTrackerReviewPayloadDTO,
} from '../dtos/community-review.dto'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { ICommunityReviewMapper } from '../mappers/community-review.mapper'

export interface IUpsertCommunityTrackerReviewUseCase {
  execute(payload: UpsertCommunityTrackerReviewPayloadDTO): Promise<UpsertCommunityTrackerReviewOutputDTO>
}

export class UpsertCommunityTrackerReviewUseCase implements IUpsertCommunityTrackerReviewUseCase {
  constructor(
    private readonly _repository: ICommunityReviewRepository,
    private readonly _mapper: ICommunityReviewMapper,
  ) {}

  async execute(
    payload: UpsertCommunityTrackerReviewPayloadDTO,
  ): Promise<UpsertCommunityTrackerReviewOutputDTO> {
    const review = await this._repository.upsertTrackerReview({
      trackerId: payload.trackerId,
      userId: payload.userId,
      rating: this.normalizeRating(payload.rating),
      comment: payload.comment.trim(),
    })

    if (!review) {
      throw CommunityApplicationError.notFound(
        'Community tracker not found or cannot be reviewed',
      )
    }

    const tracker = await this._repository.findPublicTrackerDetail(
      payload.trackerId,
      payload.userId,
    )

    if (!tracker) {
      throw CommunityApplicationError.notFound('Community tracker not found')
    }

    return {
      review: this._mapper.toReviewView(review),
      ratingSummary: this._mapper.toPublicTrackerDetailView(tracker).ratingSummary,
    }
  }

  private normalizeRating(value: number): number {
    return Math.min(Math.max(Math.floor(value), 1), 5)
  }
}
