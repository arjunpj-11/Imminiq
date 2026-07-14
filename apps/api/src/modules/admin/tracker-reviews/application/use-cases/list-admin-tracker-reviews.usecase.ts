import type { AdminListQuery, AdminPage } from '../../../shared';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
import type { IAdminTrackerReviewDTO } from '../admin-tracker-reviews.dto';
import type { IAdminTrackerReviewsMapper } from '../admin-tracker-reviews.mapper';

export interface IListAdminTrackerReviewsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<IAdminTrackerReviewDTO>>;
}

export class ListAdminTrackerReviewsUseCase implements IListAdminTrackerReviewsUseCase {
  constructor(
    private readonly repository: IAdminTrackerReviewsRepository,
    private readonly mapper: IAdminTrackerReviewsMapper
  ) {}

  async execute(query: AdminListQuery): Promise<AdminPage<IAdminTrackerReviewDTO>> {
    return this.mapper.toPageDTO(await this.repository.list(query));
  }
}
