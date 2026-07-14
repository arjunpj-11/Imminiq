import type { IAddAdminTrackerReviewConsensusUseCase } from './use-cases/add-admin-tracker-review-consensus.usecase';
import type { IListAdminTrackerReviewsUseCase } from './use-cases/list-admin-tracker-reviews.usecase';
import type { IResolveAdminTrackerReviewUseCase } from './use-cases/resolve-admin-tracker-review.usecase';

export type AdminTrackerReviewsUseCases = {
  list: IListAdminTrackerReviewsUseCase;
  addConsensus: IAddAdminTrackerReviewConsensusUseCase;
  resolve: IResolveAdminTrackerReviewUseCase;
};
