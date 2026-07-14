import type { AdminListQuery, AdminPage } from '../../../shared';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import type { IAdminTrackerDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface IListAdminTrackersUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<IAdminTrackerDTO>>;
}

export class ListAdminTrackersUseCase implements IListAdminTrackersUseCase {
  constructor(
    private readonly repository: IAdminTrackersRepository,
    private readonly mapper: IAdminTrackersMapper
  ) {}

  async execute(query: AdminListQuery): Promise<AdminPage<IAdminTrackerDTO>> {
    return this.mapper.toPageDTO(await this.repository.list(query));
  }
}
