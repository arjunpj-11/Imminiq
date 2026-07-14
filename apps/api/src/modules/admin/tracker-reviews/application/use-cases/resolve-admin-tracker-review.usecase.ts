import type { AdminActor } from '../../../shared/domain';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
import { AdminTrackerReviewsApplicationError } from '../admin-tracker-reviews-application.error';
import type { AdminTrackerReviewStatusResultDTO } from '../admin-tracker-reviews.dto';
import type { IAdminTrackerReviewsMapper } from '../admin-tracker-reviews.mapper';

export interface IResolveAdminTrackerReviewUseCase {
  execute(id: string, status: string, actor: AdminActor): Promise<AdminTrackerReviewStatusResultDTO>;
}

export class ResolveAdminTrackerReviewUseCase implements IResolveAdminTrackerReviewUseCase {
  constructor(
    private readonly repository: IAdminTrackerReviewsRepository,
    private readonly mapper: IAdminTrackerReviewsMapper
  ) {}

  async execute(id: string, status: string, actor: AdminActor) {
    const result = await this.repository.resolve(id, status, actor);
    if (!result) throw AdminTrackerReviewsApplicationError.notFound();
    return this.mapper.toStatusResultDTO(result);
  }
}
