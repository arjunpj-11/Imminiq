import type { ICommunityReviewRepository } from '../../domain/repositories/community-review.repository.interface';
import type {
  ToggleCommunityReviewHelpfulOutputDTO,
  ToggleCommunityReviewHelpfulPayloadDTO,
} from '../community-review.dto';
import { CommunityApplicationError } from '../community-application.error';
import type { ICommunityReviewMapper } from '../community-review.mapper';

export interface IToggleCommunityReviewHelpfulUseCase {
  execute(
    payload: ToggleCommunityReviewHelpfulPayloadDTO
  ): Promise<ToggleCommunityReviewHelpfulOutputDTO>;
}

export class ToggleCommunityReviewHelpfulUseCase implements IToggleCommunityReviewHelpfulUseCase {
  constructor(
    private readonly _repository: Pick<ICommunityReviewRepository, 'toggleReviewHelpful'>,
    private readonly _mapper: ICommunityReviewMapper
  ) {}

  async execute(
    payload: ToggleCommunityReviewHelpfulPayloadDTO
  ): Promise<ToggleCommunityReviewHelpfulOutputDTO> {
    const review = await this._repository.toggleReviewHelpful(payload.reviewId, payload.userId);

    if (!review) {
      throw CommunityApplicationError.notFound('Review not found');
    }

    return {
      review: this._mapper.toReviewView(review),
    };
  }
}
