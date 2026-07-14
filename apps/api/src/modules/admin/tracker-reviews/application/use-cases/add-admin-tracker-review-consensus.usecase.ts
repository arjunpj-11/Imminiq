import type { AdminActor } from '../../../shared';
import type {
  AdminTrackerReviewConsensusChoice,
  AdminTrackerReviewConsensusResult,
} from '../../domain/entities/admin-tracker-review.entity';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
import { AdminTrackerReviewsApplicationError } from '../admin-tracker-reviews-application.error';

export interface IAddAdminTrackerReviewConsensusUseCase {
  execute(
    id: string,
    choice: AdminTrackerReviewConsensusChoice,
    actor: AdminActor
  ): Promise<AdminTrackerReviewConsensusResult>;
}

export class AddAdminTrackerReviewConsensusUseCase
  implements IAddAdminTrackerReviewConsensusUseCase
{
  constructor(private readonly repository: IAdminTrackerReviewsRepository) {}

  async execute(id: string, choice: AdminTrackerReviewConsensusChoice, actor: AdminActor) {
    const result = await this.repository.addConsensusVote(id, choice, actor);
    if (result.kind === 'not_found') throw AdminTrackerReviewsApplicationError.notFound();
    if (result.kind === 'not_open') throw AdminTrackerReviewsApplicationError.notOpen();
    return result.value;
  }
}
