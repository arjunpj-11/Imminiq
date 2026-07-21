import type { AdminListQuery, AdminPage } from '../../../../../shared/admin';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
import type { AdminTrackerReviewDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface IListAdminTrackerReviewsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminTrackerReviewDTO>>;
}

export class ListAdminTrackerReviewsUseCase implements IListAdminTrackerReviewsUseCase {
  constructor(
    private readonly _repository: IAdminTrackerReviewsRepository,
    private readonly _mapper: IAdminTrackersMapper
  ) {}

  async execute(query: AdminListQuery) {
    return this._mapper.toReviewPageDTO(await this._repository.list(query));
  }
}
