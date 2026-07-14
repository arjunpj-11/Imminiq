import type { AdminActor } from '../../../shared/domain';
import type {
  AdminTrackerReviewConsensusChoice,
} from '../../domain/entities/admin-tracker-review.entity';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
import { AdminTrackerReviewsApplicationError } from '../admin-tracker-reviews-application.error';
import type { AdminTrackerReviewConsensusResultDTO } from '../admin-tracker-reviews.dto';
import type { IAdminTrackerReviewsMapper } from '../admin-tracker-reviews.mapper';

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
    private readonly repository: IAdminTrackerReviewsRepository,
    private readonly mapper: IAdminTrackerReviewsMapper
  ) {}

  async execute(id: string, choice: AdminTrackerReviewConsensusChoice, actor: AdminActor) {
    const result = await this.repository.addConsensusVote(id, choice, actor);
    if (result.kind === 'not_found') throw AdminTrackerReviewsApplicationError.notFound();
    if (result.kind === 'not_open') throw AdminTrackerReviewsApplicationError.notOpen();
    return this.mapper.toConsensusResultDTO(result.value);
  }
}
