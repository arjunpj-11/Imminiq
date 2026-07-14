import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared/domain';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import type { AdminPublishedTrackerDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface IListAdminPublishedTrackersUseCase {
  execute(query: AdminListQuery, actor: AdminActor): Promise<AdminPage<AdminPublishedTrackerDTO>>;
}

export class ListAdminPublishedTrackersUseCase implements IListAdminPublishedTrackersUseCase {
  constructor(
    private readonly repository: IAdminTrackersRepository,
    private readonly mapper: IAdminTrackersMapper
  ) {}

  async execute(
    query: AdminListQuery,
    actor: AdminActor
  ): Promise<AdminPage<AdminPublishedTrackerDTO>> {
    return this.mapper.toPublishedPageDTO(await this.repository.listPublished(query, actor));
  }
}
