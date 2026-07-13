import { AdminTrackerReviewsUseCase } from './application/use-cases/admin-tracker-reviews.usecase';
import { mongoAdminTrackerReviewsRepository } from './infrastructure/repositories/mongo-admin-tracker-reviews.repository';
export const createAdminTrackerReviewsComposition = () => ({
  useCase: new AdminTrackerReviewsUseCase(mongoAdminTrackerReviewsRepository),
});
