import { CommunityApplicationError } from '../errors/community-application.error'
import type { ICommunityReviewRepository } from '../../domain/repositories/community-review.repository.interface'

export type ToggleCommunityTrackerLikeInput = {
  trackerId: string
  userId: string
}

export class ToggleCommunityTrackerLikeUseCase {
  constructor(
    private readonly _communityReviewRepository: ICommunityReviewRepository,
  ) {}

  async execute(input: ToggleCommunityTrackerLikeInput) {
    const result = await this._communityReviewRepository.toggleTrackerLike(
      input.trackerId,
      input.userId,
    )

    if (!result) {
      throw CommunityApplicationError.notFound('tracker not found')
    }

    return result
  }
}