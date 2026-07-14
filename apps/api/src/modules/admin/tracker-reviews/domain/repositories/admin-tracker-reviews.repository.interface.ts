import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared';
import type {
  AdminTrackerReview,
  AdminTrackerReviewConsensusChoice,
  AdminTrackerReviewConsensusResult,
  AdminTrackerReviewStatusResult,
} from '../admin-tracker-review.entity';
export interface IAdminTrackerReviewsRepository {
  list(query: AdminListQuery): Promise<AdminPage<AdminTrackerReview>>;
  addConsensusVote(
    id: string,
    choice: AdminTrackerReviewConsensusChoice,
    actor: AdminActor
  ): Promise<AdminTrackerReviewConsensusResult>;
  resolve(id: string, status: string, actor: AdminActor): Promise<AdminTrackerReviewStatusResult>;
}
