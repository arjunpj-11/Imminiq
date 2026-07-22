import type { AdminListQuery, AdminPage } from '../../../../../shared/admin';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import type { AdminTrackerDTO } from '../admin-trackers.dto';
import type { IAdminTrackersMapper } from '../admin-trackers.mapper';

export interface IListAdminTrackersUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminTrackerDTO>>;
}

export class ListAdminTrackersUseCase implements IListAdminTrackersUseCase {
  constructor(
    private readonly _repository: Pick<IAdminTrackersRepository, 'list'>,
    private readonly _mapper: IAdminTrackersMapper
  ) {}

  async execute(query: AdminListQuery): Promise<AdminPage<AdminTrackerDTO>> {
    return this._mapper.toPageDTO(await this._repository.list(query));
  }
}
