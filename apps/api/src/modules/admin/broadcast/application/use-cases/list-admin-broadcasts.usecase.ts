import type { AdminListQuery, AdminPage } from '../../../shared';
import type { AdminBroadcast } from '../../domain/entities/admin-broadcast.entity';
import type { IAdminBroadcastRepository } from '../../domain/repositories/admin-broadcast.repository.interface';

export interface IListAdminBroadcastsUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminBroadcast>>;
}

export class ListAdminBroadcastsUseCase implements IListAdminBroadcastsUseCase {
  constructor(private readonly repository: IAdminBroadcastRepository) {}

  execute(query: AdminListQuery): Promise<AdminPage<AdminBroadcast>> {
    return this.repository.list(query);
  }
}
