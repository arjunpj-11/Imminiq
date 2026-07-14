import type { AdminListQuery, AdminPage } from '../../../shared';
import type { AdminTrackerReview } from '../../domain/entities/admin-tracker-review.entity';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';

export interface IListAdminTrackerReviewsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminTrackerReview>>;
}

export class ListAdminTrackerReviewsUseCase implements IListAdminTrackerReviewsUseCase {
  constructor(private readonly repository: IAdminTrackerReviewsRepository) {}

  execute(query: AdminListQuery) {
    return this.repository.list(query);
  }
}
