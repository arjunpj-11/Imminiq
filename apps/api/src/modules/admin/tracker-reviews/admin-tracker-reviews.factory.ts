import { AddAdminTrackerReviewConsensusUseCase } from './application/use-cases/add-admin-tracker-review-consensus.usecase';
import { ListAdminTrackerReviewsUseCase } from './application/use-cases/list-admin-tracker-reviews.usecase';
import { ResolveAdminTrackerReviewUseCase } from './application/use-cases/resolve-admin-tracker-review.usecase';
import { mongoAdminTrackerReviewsRepository } from './infrastructure/repositories/mongo-admin-tracker-reviews.repository';
export type AdminTrackerReviewsComposition = { useCases: AdminTrackerReviewsUseCases };

export const createAdminTrackerReviewsComposition = (): AdminTrackerReviewsComposition => ({
  useCases: {
    list: new ListAdminTrackerReviewsUseCase(mongoAdminTrackerReviewsRepository),
    addConsensus: new AddAdminTrackerReviewConsensusUseCase(mongoAdminTrackerReviewsRepository),
    resolve: new ResolveAdminTrackerReviewUseCase(mongoAdminTrackerReviewsRepository),
  },
});
import type { AdminTrackerReviewsUseCases } from './application/admin-tracker-reviews-use-cases.contract';
