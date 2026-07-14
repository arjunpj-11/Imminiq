import type { AdminListQuery, AdminPage } from '../../../shared/domain';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
import type { AdminTrackerReviewDTO } from '../admin-tracker-reviews.dto';
import type { IAdminTrackerReviewsMapper } from '../admin-tracker-reviews.mapper';

export interface IListAdminTrackerReviewsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminTrackerReviewDTO>>;
}

export class ListAdminTrackerReviewsUseCase implements IListAdminTrackerReviewsUseCase {
  constructor(
    private readonly repository: IAdminTrackerReviewsRepository,
    private readonly mapper: IAdminTrackerReviewsMapper
  ) {}

  async execute(query: AdminListQuery): Promise<AdminPage<AdminTrackerReviewDTO>> {
    return this.mapper.toPageDTO(await this.repository.list(query));
  }
}
