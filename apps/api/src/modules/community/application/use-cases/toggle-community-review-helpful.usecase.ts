import type { CommunityReviewRepositoryContract } from '../../domain/repositories/community-review.repository.interface'
import type {
  ToggleCommunityReviewHelpfulOutputDto,
  ToggleCommunityReviewHelpfulPayload,
} from '../dtos/community-review.dto'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { CommunityReviewMapperContract } from '../mappers/community-review.mapper'

export class ToggleCommunityReviewHelpfulUseCase {
  constructor(
    private readonly repository: CommunityReviewRepositoryContract,
    private readonly mapper: CommunityReviewMapperContract,
  ) {}

  async execute(
    payload: ToggleCommunityReviewHelpfulPayload,
  ): Promise<ToggleCommunityReviewHelpfulOutputDto> {
    const review = await this.repository.toggleReviewHelpful(
      payload.reviewId,
      payload.userId,
    )

    if (!review) {
      throw CommunityApplicationError.notFound('Review not found')
    }

    return {
      review: this.mapper.toReviewView(review),
    }
  }
}