import type { AdminActor, AdminListQuery, AdminPage } from '../../../../../shared/admin';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import type { AdminPublishedTrackerDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface IListAdminPublishedTrackersUseCase {
  execute(query: AdminListQuery, actor: AdminActor): Promise<AdminPage<AdminPublishedTrackerDTO>>;
}

export class ListAdminPublishedTrackersUseCase implements IListAdminPublishedTrackersUseCase {
  constructor(
    private readonly _repository: Pick<IAdminTrackersRepository, 'listPublished'>,
    private readonly _mapper: IAdminTrackersMapper
  ) {}

  async execute(
    query: AdminListQuery,
    actor: AdminActor
  ): Promise<AdminPage<AdminPublishedTrackerDTO>> {
    return this._mapper.toPublishedPageDTO(await this._repository.listPublished(query, actor));
  }
}
