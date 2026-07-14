import type { AdminActor } from '../../../shared';
import type { AdminTrackerReviewStatusResult } from '../../domain/entities/admin-tracker-review.entity';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
import { AdminTrackerReviewsApplicationError } from '../admin-tracker-reviews-application.error';

export interface IResolveAdminTrackerReviewUseCase {
  execute(id: string, status: string, actor: AdminActor): Promise<AdminTrackerReviewStatusResult>;
}

export class ResolveAdminTrackerReviewUseCase implements IResolveAdminTrackerReviewUseCase {
  constructor(private readonly repository: IAdminTrackerReviewsRepository) {}

  async execute(id: string, status: string, actor: AdminActor) {
    const result = await this.repository.resolve(id, status, actor);
    if (!result) throw AdminTrackerReviewsApplicationError.notFound();
    return result;
  }
}
