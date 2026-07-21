import type { AdminListQuery, AdminPage } from '../../../../../shared/admin';
import type { IAdminBroadcastRepository } from '../../domain/repositories/admin-broadcast.repository.interface';
import type { AdminBroadcastDTO } from '../admin-broadcast.dto';
import type { IAdminBroadcastMapper } from '../admin-broadcast.mapper';

export interface IListAdminBroadcastsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminBroadcastDTO>>;
}

export class ListAdminBroadcastsUseCase implements IListAdminBroadcastsUseCase {
  constructor(
    private readonly _repository: IAdminBroadcastRepository,
    private readonly _mapper: IAdminBroadcastMapper
  ) {}

  async execute(query: AdminListQuery): Promise<AdminPage<AdminBroadcastDTO>> {
    return this._mapper.toPageDTO(await this._repository.list(query));
  }
}
