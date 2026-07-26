import type { AdminActor } from '../../../../../shared/admin';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';
import type { AdminTrackerReviewStatusResultDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';
import type { ICommunityVerificationRewardService } from '../../../../user/community';

export interface IResolveAdminTrackerReviewUseCase {
  execute(
    id: string,
    status: string,
    actor: AdminActor
  ): Promise<AdminTrackerReviewStatusResultDTO>;
}

export class ResolveAdminTrackerReviewUseCase implements IResolveAdminTrackerReviewUseCase {
  constructor(
    private readonly _repository: IAdminTrackerReviewsRepository,
    private readonly _mapper: IAdminTrackersMapper,
    private readonly _rewardService: ICommunityVerificationRewardService
  ) {}

  async execute(id: string, status: string, actor: AdminActor) {
    const result = await this._repository.resolve(id, status, actor);
    if (!result) throw AdminTrackersApplicationError.reviewNotFound();
    if (result.rewardContext) {
      await this._rewardService.settle(result.rewardContext);
    }
    return this._mapper.toReviewStatusResultDTO(result);
  }
}
