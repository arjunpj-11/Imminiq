import { CommunityApplicationError } from '../community-application.error';
import type { ICommunityReviewRepository } from '../../domain/repositories/community-review.repository.interface';
import type {
  ToggleCommunityTrackerLikePayloadDTO,
  ToggleCommunityTrackerLikeOutputDTO,
} from '../community-review.dto';

export interface IToggleCommunityTrackerLikeUseCase {
  execute(
    input: ToggleCommunityTrackerLikePayloadDTO
  ): Promise<ToggleCommunityTrackerLikeOutputDTO>;
}

export class ToggleCommunityTrackerLikeUseCase implements IToggleCommunityTrackerLikeUseCase {
  constructor(
    private readonly _communityReviewRepository: Pick<
      ICommunityReviewRepository,
      'toggleTrackerLike'
    >
  ) {}

  async execute(input: ToggleCommunityTrackerLikePayloadDTO) {
    const result = await this._communityReviewRepository.toggleTrackerLike(
      input.trackerId,
      input.userId
    );

    if (!result) {
      throw CommunityApplicationError.notFound('tracker not found');
    }

    return result;
  }
}
