import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared/domain';
import type {
  AdminTrackerReview,
  AdminTrackerReviewConsensusChoice,
  AdminTrackerReviewConsensusRepositoryResult,
  AdminTrackerReviewStatusResult,
} from '../entities/admin-tracker-review.entity';

export interface IAdminTrackerReviewsRepository {
  list(query: AdminListQuery): Promise<AdminPage<AdminTrackerReview>>;
  addConsensusVote(
    id: string,
    choice: AdminTrackerReviewConsensusChoice,
    actor: AdminActor
  ): Promise<AdminTrackerReviewConsensusRepositoryResult>;
  resolve(id: string, status: string, actor: AdminActor): Promise<AdminTrackerReviewStatusResult | null>;
}
