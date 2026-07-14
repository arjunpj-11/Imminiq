// apps/api/src/modules/user/community/application/use-cases/
// clone-community-tracker.usecase.ts

import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface';
import type { ICommunityActivityRecorder } from '../../domain/services/community-activity.interface';
import { CommunityApplicationError } from '../community-application.error';
import type { ICommunityTrackerViewDTO } from '../community.dto';
import type { ICommunityMapper } from '../community.mapper';

export interface ICloneCommunityTrackerUseCase {
  execute(trackerId: string, userId: string): Promise<{ tracker: ICommunityTrackerViewDTO }>;
}

export class CloneCommunityTrackerUseCase implements ICloneCommunityTrackerUseCase {
  constructor(
    private readonly _repository: ICommunityRepository,
    private readonly _activityRecorder: ICommunityActivityRecorder,
    private readonly _mapper: ICommunityMapper
  ) {}

  async execute(trackerId: string, userId: string) {
    const sourceTracker = await this._repository.findCommunityTrackerById(trackerId, userId);

    if (!sourceTracker) {
      throw CommunityApplicationError.notFound('Community tracker not found or cannot be cloned');
    }

    const clonedTracker = await this._repository.cloneTrackerForUser(trackerId, userId);

    if (!clonedTracker) {
      throw CommunityApplicationError.notFound('Community tracker not found or cannot be cloned');
    }

    /*
     * When the owner tries to clone their own tracker,
     * cloneTrackerForUser() returns the original tracker.
     *
     * In that case no clone was created, so no activity
     * should be recorded.
     */
    const isActualClone = clonedTracker.id !== sourceTracker.id;

    if (isActualClone) {
      await this._activityRecorder.recordTrackerCloned({
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
      });
    }

    return {
      tracker: this._mapper.toTrackerView(clonedTracker),
    };
  }
}
