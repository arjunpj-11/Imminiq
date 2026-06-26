import type { CommunityReviewRepositoryContract } from '../../domain/repositories/community-review.repository.interface'
import type {
  UpsertCommunityTrackerReviewOutputDto,
  UpsertCommunityTrackerReviewPayload,
} from '../dtos/community-review.dto'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { CommunityReviewMapperContract } from '../mappers/community-review.mapper'

export class UpsertCommunityTrackerReviewUseCase {
  constructor(
    private readonly repository: CommunityReviewRepositoryContract,
    private readonly mapper: CommunityReviewMapperContract,
  ) {}

  async execute(
    payload: UpsertCommunityTrackerReviewPayload,
  ): Promise<UpsertCommunityTrackerReviewOutputDto> {
    const review = await this.repository.upsertTrackerReview({
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

    const tracker = await this.repository.findPublicTrackerDetail(
      payload.trackerId,
      payload.userId,
    )

    if (!tracker) {
      throw CommunityApplicationError.notFound('Community tracker not found')
    }

    return {
      review: this.mapper.toReviewView(review),
      ratingSummary: this.mapper.toPublicTrackerDetailView(tracker).ratingSummary,
    }
  }

  private normalizeRating(value: number): number {
    return Math.min(Math.max(Math.floor(value), 1), 5)
  }
}
