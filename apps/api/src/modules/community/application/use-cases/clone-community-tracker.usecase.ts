// apps/api/src/modules/community/application/use-cases/
// clone-community-tracker.usecase.ts

import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import type { CommunityActivityServiceContract } from '../../domain/services/community-activity.service.interface'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { CommunityMapperContract } from '../mappers/community.mapper'

export class CloneCommunityTrackerUseCase {
  constructor(
    private readonly _repository: CommunityRepositoryContract,
    private readonly _activityService: CommunityActivityServiceContract,
    private readonly _mapper: CommunityMapperContract,
  ) {}

  async execute(
    trackerId: string,
    userId: string,
  ) {
    const sourceTracker =
      await this._repository.findCommunityTrackerById(
        trackerId,
        userId,
      )

    if (!sourceTracker) {
      throw CommunityApplicationError.notFound(
        'Community tracker not found or cannot be cloned',
      )
    }

    const clonedTracker =
      await this._repository.cloneTrackerForUser(
        trackerId,
        userId,
      )

    if (!clonedTracker) {
      throw CommunityApplicationError.notFound(
        'Community tracker not found or cannot be cloned',
      )
    }

    /*
     * When the owner tries to clone their own tracker,
     * cloneTrackerForUser() returns the original tracker.
     *
     * In that case no clone was created, so no activity
     * should be recorded.
     */
    const isActualClone =
      clonedTracker.id !== sourceTracker.id

    if (isActualClone) {
      await this._activityService.recordTrackerCloned({
        userId,
        sourceUserId: sourceTracker.ownerId,
        sourceTrackerId: sourceTracker.id,
        clonedTrackerId: clonedTracker.id,
        trackerTitle: clonedTracker.title,

        /*
         * Do not send clonedTracker.createdAt here.
         *
         * The activity module will use the current time.
         * This also allows old clones that were created before
         * activity integration to appear in the recent feed.
         */
      })
    }

    return {
      tracker:
        this._mapper.toTrackerView(
          clonedTracker,
        ),
    }
  }
}