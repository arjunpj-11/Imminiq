import { AddAdminTrackerReviewConsensusUseCase } from './application/use-cases/add-admin-tracker-review-consensus.usecase';
import { ListAdminTrackerReviewsUseCase } from './application/use-cases/list-admin-tracker-reviews.usecase';
import { ResolveAdminTrackerReviewUseCase } from './application/use-cases/resolve-admin-tracker-review.usecase';
import { mongoAdminTrackerReviewsRepository } from './infrastructure/repositories/mongo-admin-tracker-reviews.repository';
import { AdminTrackerReviewsMapper } from './application/admin-tracker-reviews.mapper';
export type AdminTrackerReviewsComposition = { useCases: AdminTrackerReviewsUseCases };

export const createAdminTrackerReviewsComposition = (): AdminTrackerReviewsComposition => {
  const mapper = new AdminTrackerReviewsMapper();
  return {
    useCases: {
      list: new ListAdminTrackerReviewsUseCase(mongoAdminTrackerReviewsRepository, mapper),
      addConsensus: new AddAdminTrackerReviewConsensusUseCase(
        mongoAdminTrackerReviewsRepository,
        mapper
      ),
      resolve: new ResolveAdminTrackerReviewUseCase(mongoAdminTrackerReviewsRepository, mapper),
    },
  };
};
import type { AdminTrackerReviewsUseCases } from './application/admin-tracker-reviews-use-cases.contract';
