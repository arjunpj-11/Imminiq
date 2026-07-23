import type { AdminActor } from '../../../../../shared/admin';
import type { AdminTrackerReviewConsensusChoice } from '../../domain/entities/admin-tracker-review.entity';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
import { AdminTrackersApplicationError } from '../admin-trackers-application.error';
import type { AdminTrackerReviewConsensusResultDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface IAddAdminTrackerReviewConsensusUseCase {
  execute(
    id: string,
    choice: AdminTrackerReviewConsensusChoice,
    actor: AdminActor
  ): Promise<AdminTrackerReviewConsensusResultDTO>;
}

export class AddAdminTrackerReviewConsensusUseCase
  implements IAddAdminTrackerReviewConsensusUseCase
{
  constructor(
    private readonly _repository: IAdminTrackerReviewsRepository,
    private readonly _mapper: IAdminTrackersMapper
  ) {}

  async execute(id: string, choice: AdminTrackerReviewConsensusChoice, actor: AdminActor) {
    const result = await this._repository.addConsensusVote(id, choice, actor);
    if (result.kind === 'not_found') throw AdminTrackersApplicationError.reviewNotFound();
    if (result.kind === 'not_open') throw AdminTrackersApplicationError.reviewNotOpen();
    return this._mapper.toReviewConsensusResultDTO(result.value);
  }
}
