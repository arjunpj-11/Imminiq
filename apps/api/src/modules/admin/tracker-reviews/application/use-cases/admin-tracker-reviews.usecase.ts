import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared';
import type {
  AdminTrackerReview,
  AdminTrackerReviewConsensusChoice,
  AdminTrackerReviewConsensusResult,
  AdminTrackerReviewStatusResult,
} from '../../domain/admin-tracker-review.entity';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
export interface IAdminTrackerReviewsUseCase {
  list(query: AdminListQuery): Promise<AdminPage<AdminTrackerReview>>;
  addConsensusVote(
    id: string,
    choice: AdminTrackerReviewConsensusChoice,
    actor: AdminActor
  ): Promise<AdminTrackerReviewConsensusResult>;
  resolve(id: string, status: string, actor: AdminActor): Promise<AdminTrackerReviewStatusResult>;
}
export class AdminTrackerReviewsUseCase implements IAdminTrackerReviewsUseCase {
  constructor(private readonly repository: IAdminTrackerReviewsRepository) {}
  list(query: AdminListQuery) {
    return this.repository.list(query);
  }
  addConsensusVote(id: string, choice: AdminTrackerReviewConsensusChoice, actor: AdminActor) {
    return this.repository.addConsensusVote(id, choice, actor);
  }
  resolve(id: string, status: string, actor: AdminActor) {
    return this.repository.resolve(id, status, actor);
  }
}
